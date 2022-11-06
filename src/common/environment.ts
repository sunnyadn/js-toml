class Environment {
  private debug: boolean = false;

  public enableDebug() {
    this.debug = true;
  }

  public get isDebug() {
    return this.debug;
  }
}

export const envs = new Environment();
