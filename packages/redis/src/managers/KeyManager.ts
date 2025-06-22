class KeyManager {
  public getOauthStateKey(state: string) {
    return `Oauth:${state}`;
  }

  public getInstallationStateKey(state: string) {
    return `Installation:${state}`;
  }
}

export const keymanager = new KeyManager();
