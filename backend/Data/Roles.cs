using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace LegalMatters.Data;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Lawyer = "Lawyer";

    public static string[] All = [Admin, Lawyer];
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoleEnum
{
    [EnumMember(Value = Roles.Admin)]
    Admin,

    [EnumMember(Value = Roles.Lawyer)]
    Lawyer,
}
