class KeyManager {
  public getOauthStateKey(state: string) {
    return `Oauth:${state}`;
  }
}

export const keymanager = new KeyManager();
