namespace LegalMatters.Data;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Lawyer = "Laywer";
    public const string Client = "Client";

    public static string[] All = [Admin, Lawyer, Client];
}
