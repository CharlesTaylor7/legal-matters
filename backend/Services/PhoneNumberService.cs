using System;
using System.Text.RegularExpressions;

namespace LegalMatters.Services;

public interface IPhoneNumberService
{
    string NormalizePhoneNumber(string phoneNumber);
    string FormatPhoneNumber(string normalizedPhoneNumber);
}

public class USPhoneNumberService : IPhoneNumberService
{
    /// <summary>
    /// Normalizes a US phone number by removing all non-digit characters.
    /// </summary>
    /// <param name="phoneNumber">The phone number to normalize</param>
    /// <returns>A normalized 10-digit phone number string</returns>
    /// <exception cref="ArgumentException">Thrown when the phone number is invalid</exception>
    public string NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            throw new ArgumentException("Phone number cannot be empty", nameof(phoneNumber));
        }

        // Remove all non-digit characters
        string normalized = Regex.Replace(phoneNumber, @"\D", "");

        // Handle case where number might start with "1" (country code)
        if (normalized.Length == 11 && normalized[0] == '1')
        {
            normalized = normalized.Substring(1);
        }

        // Validate that we have exactly 10 digits
        if (normalized.Length != 10)
        {
            throw new ArgumentException(
                $"Phone number must be 10 digits: {phoneNumber}",
                nameof(phoneNumber)
            );
        }

        return normalized;
    }

    /// <summary>
    /// Formats a normalized 10-digit phone number into a readable format (XXX) XXX-XXXX
    /// </summary>
    /// <param name="phoneNumber">The normalized 10-digit phone number</param>
    /// <returns>A formatted phone number string</returns>
    /// <exception cref="ArgumentException">Thrown when the normalized phone number is invalid</exception>
    public string FormatPhoneNumber(string phoneNumber)
    {
        return $"({phoneNumber.Substring(0, 3)}) {phoneNumber.Substring(3, 3)}-{phoneNumber.Substring(6)}";
    }
}
