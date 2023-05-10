// similar code from tenant sign-up node
export class EmailBlacklistService {
    private readonly blacklist = [
        'tmpeml.com',
        'tmpbox.net',
        'moakt.cc',
        'disbox.net',
        'tmpmail.org',
        'azteen.com',
        'chokxus.com',
        'tmpmail.net',
        'tmails.net',
        'disbox.org',
        'angeleslid',
        'moakt.co',
        'moakt.ws',
        'qq.com',
        'tmail.ws',
        'teml.net',
        'bareed.ws'
    ];
    public throwIfBlacklisted(email: string) {
        const isBlacklisted = this.blacklist.find((domain) => email.toLocaleLowerCase().includes(domain));
        if (isBlacklisted) {
            throw new Error('Heute leider nicht.');
        }
    }
}
