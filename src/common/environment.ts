class Environment {
  private debug = false;

  public enableDebug() {
    this.debug = true;
  }

  public isDebug() {
    return this.debug;
  }
}

export const envs = new Environment();
