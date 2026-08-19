namespace Shopfloor.Application.Common;

public sealed class NotFoundException(string message) : Exception(message);
public sealed class ValidationException(string message) : Exception(message);
public sealed class UnauthorizedException(string message) : Exception(message);
