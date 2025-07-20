class KeyManager {
  public getOauthStateKey(state: string) {
    return `Oauth:${state}`;
  }

  public getInstallationStateKey(state: string) {
    return `Installation:${state}`;
  }

  public getStatusKey(id: string) {
    return `status:${id}`;
  }

  public getLogsKey(id: string) {
    return `logs:${id}`;
  }

  public getChannelKey(id: string) {
    return `channel:${id}`;
  }
}

export const keymanager = new KeyManager();
