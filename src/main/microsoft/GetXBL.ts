export interface GetXBL {
    IssueInstant: string,
    NotAfter: string,
    Token: string,
    DisplayClaims: {
        xui: Array<Uhs>
    }
}

interface Uhs{
    uhs: string
}