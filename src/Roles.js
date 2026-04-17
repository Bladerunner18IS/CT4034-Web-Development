class Roles {
    static ADMIN = "admin";
    static POLICE = "police";
    static PUBLIC = "public";
    static GUEST = "guest";

    static isValid(role) {
        return [Roles.ADMIN, Roles.POLICE, Roles.PUBLIC, Roles.GUEST].includes(role);
    }

    static homepage(role) {
        switch (role) {
            case Roles.ADMIN:
                return "/admin";
            case Roles.POLICE:
                return "/police";
            case Roles.PUBLIC:
                return "/";
            default:
                return "/login";
        }
    }
}

export default Roles;