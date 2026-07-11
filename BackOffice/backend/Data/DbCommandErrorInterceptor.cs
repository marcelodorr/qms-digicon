using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend.Data
{
    public sealed class DbCommandErrorInterceptor : DbCommandInterceptor
    {
        private readonly DbCommandErrorCapture _capture;

        public DbCommandErrorInterceptor(DbCommandErrorCapture capture)
        {
            _capture = capture;
        }

        public override void CommandFailed(DbCommand command, CommandErrorEventData eventData)
        {
            _capture.Current = DbCommandErrorInfo.FromCommand(command);
            base.CommandFailed(command, eventData);
        }

        public override Task CommandFailedAsync(
            DbCommand command,
            CommandErrorEventData eventData,
            CancellationToken cancellationToken = default)
        {
            _capture.Current = DbCommandErrorInfo.FromCommand(command);
            return base.CommandFailedAsync(command, eventData, cancellationToken);
        }
    }
}
