using System;

namespace Planca.Application.Common.Exceptions
{
    public class UnauthorizedAccessException : Exception
    {
        public UnauthorizedAccessException()
            : base("Authentication is required to perform this action.")
        {
        }

        public UnauthorizedAccessException(string message)
            : base(message)
        {
        }

        public UnauthorizedAccessException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}