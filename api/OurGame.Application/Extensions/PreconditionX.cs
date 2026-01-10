using System;

namespace OurGame.Application.Extensions
{
    public static class PreconditionX
    {
        public static T CheckNotNull<T>(this T reference, string property)
        {
            if (reference == null)
            {
                throw new ArgumentNullException(property);
            }

            return reference;
        }
    }
}
