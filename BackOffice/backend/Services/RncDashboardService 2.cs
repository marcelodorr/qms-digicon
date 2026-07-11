using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class RncDashboardFilters
    {
        public string? Machine { get; set; }
        public string? Operator { get; set; }
        public string? Client { get; set; }
        public string? Reason { get; set; }
        public string? Cause { get; set; }
        public string? PartNumber { get; set; }
        public string? ProductionOrder { get; set; }
        public string? Origin { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
    }

    public record RncChartItemDto(string Label, int Count);

    public record RncParetoItemDto(string Label, int Count, double Percent, double CumulativePercent);

    public record RncFilterOptionsDto(
        List<string> Machines,
        List<string> Operators,
        List<string> Clients,
        List<string> Reasons,
        List<string> Causes,
        List<string> PartNumbers,
        List<string> ProductionOrders,
        List<string> Origins
    );

    public record RncDashboardOverviewDto(
        int Total,
        List<RncChartItemDto> ByMachine,
        List<RncChartItemDto> ByOperator,
        List<RncChartItemDto> ByReason,
        List<RncChartItemDto> ByCause,
        List<RncParetoItemDto> ParetoTop
    );

    public class RncDashboardService
    {
        private const string UnknownLabel = "Nao informado";
        private readonly AppDbContext _context;

        public RncDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RncFilterOptionsDto> GetFilterOptionsAsync(RncDashboardFilters? filters)
        {
            var query = ApplyDateFilters(
                _context.RncEntries.AsNoTracking(),
                filters?.From,
                filters?.To
            );

            var machines = await DistinctValuesAsync(query.Select(r => r.Machine));
            var operators = await DistinctValuesAsync(query.Select(r => r.Operator));
            var clients = await DistinctValuesAsync(query.Select(r => r.Client));
            var reasons = await DistinctValuesAsync(query.Select(r => r.Reason));
            var causes = await DistinctValuesAsync(query.Select(r => r.Cause));
            var partNumbers = await DistinctValuesAsync(query.Select(r => r.PartNumber));
            var orders = await DistinctValuesAsync(query.Select(r => r.ProductionOrder));
            var origins = await DistinctValuesAsync(query.Select(r => r.Origin));

            return new RncFilterOptionsDto(
                machines,
                operators,
                clients,
                reasons,
                causes,
                partNumbers,
                orders,
                origins
            );
        }

        public async Task<RncDashboardOverviewDto> GetOverviewAsync(RncDashboardFilters filters)
        {
            var query = ApplyFilters(_context.RncEntries.AsNoTracking(), filters);

            var total = await query
                .Select(r => r.NonConformityQuantity ?? 0)
                .SumAsync();

            var byMachine = await GroupByLabelAsync(query, r => r.Machine);
            var byOperator = await GroupByLabelAsync(query, r => r.Operator);
            var byReason = await GroupByLabelAsync(query, r => r.Reason);
            var byCause = await GroupByLabelAsync(query, r => r.Cause);

            var paretoTop = BuildPareto(byReason);

            return new RncDashboardOverviewDto(
                total,
                byMachine,
                byOperator,
                byReason,
                byCause,
                paretoTop
            );
        }

        private static string? NormalizeFilter(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static IQueryable<RncModel> ApplyFilters(IQueryable<RncModel> query, RncDashboardFilters filters)
        {
            var machine = NormalizeFilter(filters.Machine);
            var operatorName = NormalizeFilter(filters.Operator);
            var client = NormalizeFilter(filters.Client);
            var reason = NormalizeFilter(filters.Reason);
            var cause = NormalizeFilter(filters.Cause);
            var partNumber = NormalizeFilter(filters.PartNumber);
            var productionOrder = NormalizeFilter(filters.ProductionOrder);
            var origin = NormalizeFilter(filters.Origin);

            if (machine != null)
            {
                query = query.Where(r => r.Machine == machine);
            }

            if (operatorName != null)
            {
                query = query.Where(r => r.Operator == operatorName);
            }

            if (client != null)
            {
                query = query.Where(r => r.Client == client);
            }

            if (reason != null)
            {
                query = query.Where(r => r.Reason == reason);
            }

            if (cause != null)
            {
                query = query.Where(r => r.Cause == cause);
            }

            if (partNumber != null)
            {
                query = query.Where(r => r.PartNumber == partNumber);
            }

            if (productionOrder != null)
            {
                query = query.Where(r => r.ProductionOrder == productionOrder);
            }

            if (origin != null)
            {
                query = query.Where(r => r.Origin == origin);
            }

            return ApplyDateFilters(query, filters.From, filters.To);
        }

        private static IQueryable<RncModel> ApplyDateFilters(
            IQueryable<RncModel> query,
            DateTime? from,
            DateTime? to
        )
        {
            if (from.HasValue && to.HasValue && to.Value.Date < from.Value.Date)
            {
                (from, to) = (to, from);
            }

            if (from.HasValue)
            {
                var start = from.Value.Date;
                query = query.Where(r => r.NonConformityDate >= start);
            }

            if (to.HasValue)
            {
                var endExclusive = to.Value.Date.AddDays(1);
                query = query.Where(r => r.NonConformityDate < endExclusive);
            }

            return query;
        }

        private static async Task<List<RncChartItemDto>> GroupByLabelAsync(
            IQueryable<RncModel> query,
            System.Linq.Expressions.Expression<Func<RncModel, string?>> selector
        )
        {
            var rawItems = await query
                .GroupBy(selector)
                .Select(group => new
                {
                    Label = group.Key,
                    Count = group.Sum(r => r.NonConformityQuantity ?? 0)
                })
                .OrderByDescending(item => item.Count)
                .ThenBy(item => item.Label)
                .ToListAsync();

            return rawItems
                .Select(item => new RncChartItemDto(
                    string.IsNullOrEmpty(item.Label) ? UnknownLabel : item.Label,
                    item.Count
                ))
                .ToList();
        }

        private static List<RncParetoItemDto> BuildPareto(List<RncChartItemDto> reasonCounts)
        {
            var total = reasonCounts.Sum(item => item.Count);
            if (total == 0)
            {
                return new List<RncParetoItemDto>();
            }

            var cumulative = 0;
            return reasonCounts
                .OrderByDescending(item => item.Count)
                .Take(10)
                .Select(item =>
                {
                    cumulative += item.Count;
                    var percent = Math.Round((item.Count / (double)total) * 100, 2);
                    var cumulativePercent = Math.Round((cumulative / (double)total) * 100, 2);
                    return new RncParetoItemDto(item.Label, item.Count, percent, cumulativePercent);
                })
                .ToList();
        }

        private static async Task<List<string>> DistinctValuesAsync(IQueryable<string?> query)
        {
            var values = await query.ToListAsync();

            return values
                .Select(value => value?.Trim())
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Distinct(StringComparer.Ordinal)
                .OrderBy(value => value, StringComparer.Ordinal)
                .ToList();
        }
    }
}
