import { BuildURI, Result, URI } from "@adviser/cement";
import { bs, NotFoundError, PARAM, SuperThis } from "@fireproof/core";

export class DiyGateway implements bs.Gateway {
  readonly memorys: Map<string, Uint8Array>;
  readonly sthis: SuperThis;
  // readonly logger: Logger;
  constructor(sthis: SuperThis, memorys: Map<string, Uint8Array>) {
    // console.log("MemoryGateway", memorys);
    this.memorys = memorys;
    // this.logger = ensureLogger(sthis, "MemoryGateway");
    this.sthis = sthis;
  }

  buildUrl(baseUrl: URI, key: string): Promise<Result<URI>> {
    return Promise.resolve(Result.Ok(baseUrl.build().setParam(PARAM.KEY, key).URI()));
  }
  start(baseUrl: URI): Promise<Result<URI>> {
    return Promise.resolve(Result.Ok(baseUrl.build().setParam(PARAM.VERSION, "diy-0.0").URI()));
  }
  close(): Promise<bs.VoidResult> {
    return Promise.resolve(Result.Ok(undefined));
  }
  destroy(baseUrl: URI): Promise<bs.VoidResult> {
    const keyUrl = baseUrl.toString();
    for (const key of this.memorys.keys()) {
      if (key.startsWith(keyUrl)) {
        this.memorys.delete(key);
      }
    }
    this.memorys.clear();
    return Promise.resolve(Result.Ok(undefined));
  }

  async put(url: URI, bytes: Uint8Array): Promise<bs.VoidResult> {
    // ensureLogger(sthis, "MemoryGateway").Debug().Str("url", url.toString()).Msg("put");
    // this.sthis.logger.Warn().Url(url).Msg("put");
    this.memorys.set(url.toString(), bytes);
    return Result.Ok(undefined);
  }
  // get could return a NotFoundError if the key is not found
  get(url: URI): Promise<bs.GetResult> {
    // ensureLogger(sthis, "MemoryGateway").Debug().Str("url", url.toString()).Msg("put");
    const x = this.memorys.get(url.toString());
    if (!x) {
      // const possible = Array.from(this.memorys.keys()).filter(i => i.startsWith(url.build().cleanParams().toString()))
      // this.sthis.logger.Warn().Any("possible", possible).Url(url).Msg("not found");
      return Promise.resolve(Result.Err(new NotFoundError(`not found: ${url.toString()}`)));
    }
    return Promise.resolve(Result.Ok(x));
  }
  delete(url: URI): Promise<bs.VoidResult> {
    this.memorys.delete(url.toString());
    return Promise.resolve(Result.Ok(undefined));
  }

  async getPlain(url: URI, key: string): Promise<Result<Uint8Array>> {
    const x = this.memorys.get(url.build().setParam(PARAM.KEY, key).toString());
    if (!x) {
      return Result.Err(new NotFoundError("not found"));
    }
    return Result.Ok(x);
  }
}


const memory = new Map<string, Uint8Array>();

export function registerDIY() {
bs.registerStoreProtocol({
  protocol: "diy:",
  isDefault: false,
  defaultURI: () => {
    return BuildURI.from("diy://").pathname("do-it-your-self").URI();
  },
  gateway: async (sthis) => {
    return new DiyGateway(sthis, memory);
  },
});

}
