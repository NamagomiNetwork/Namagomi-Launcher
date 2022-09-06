import fetch, {Response} from 'electron-fetch'

export class OctoCat {
    private response: Promise<Response>

    constructor() {
        this.response = fetch('https://api.github.com/users/octocat')
    }

    public async getRateLimitLimit() {
        return (await this.response).headers.get('X-RateLimit-Limit')
    }

    public async getRateLimitRemaining() {
        return (await this.response).headers.get('X-RateLimit-Remaining')
    }

    /**
     * @return UTC epoch seconds
     */
    public async getRateLimitReset() {
        return (await this.response).headers.get('X-RateLimit-Reset')
    }

    public async getRateLimitUsed() {
        return (await this.response).headers.get('X-RateLimit-Used')
    }
}