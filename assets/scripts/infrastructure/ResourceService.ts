import {
  Asset,
  AssetManager,
  Constructor,
  JsonAsset,
  Node,
  Prefab,
  SpriteFrame,
  Texture2D,
  assetManager,
  instantiate,
} from 'cc';

type AssetConstructor<T extends Asset> = Constructor<T>;

export const ResourceKeys = {
  Prefab: {
    Player: 'prefab/player/Player',
    Reel: 'prefab/slot/Reel',
    Symbol: 'prefab/slot/Symbol',
    WinEffect: 'prefab/slot/WinEffect',
    Terminal: 'prefab/terminals/Terminal',
    BonusTerminal: 'prefab/terminals/BonusTerminal',
    HUD: 'prefab/ui/HUD',
    Loading: 'prefab/ui/Loading',
    Popup: 'prefab/ui/Popup',
  },
  Translation: {
    En: 'translation/en',
  },
  Image: {
    MainBackground: 'img/background/main-bg',
  },
} as const;

export const ResourcePreloadGroups = {
  CorePrefabs: [
    ResourceKeys.Prefab.Player,
    ResourceKeys.Prefab.Terminal,
    ResourceKeys.Prefab.BonusTerminal,
    ResourceKeys.Prefab.HUD,
  ],
  SlotPrefabs: [
    ResourceKeys.Prefab.Reel,
    ResourceKeys.Prefab.Symbol,
    ResourceKeys.Prefab.WinEffect,
  ],
  Translations: [
    ResourceKeys.Translation.En,
  ],
} as const;

export class ResourceService {
  private static readonly ResourcesBundleName = 'resources';

  private readonly cache = new Map<string, Asset>();
  private readonly pendingLoads = new Map<string, Promise<Asset>>();
  private bundle: AssetManager.Bundle | null = null;
  private pendingBundle: Promise<AssetManager.Bundle> | null = null;

  load<T extends Asset>(path: string, type: AssetConstructor<T>): Promise<T> {
    const cached = this.cache.get(path);
    if (cached) {
      return Promise.resolve(cached as T);
    }

    const pending = this.pendingLoads.get(path);
    if (pending) {
      return pending as Promise<T>;
    }

    const loadPromise = this.getBundle()
      .then((bundle) => new Promise<T>((resolve, reject) => {
        bundle.load(path, type, (error, asset) => {
          this.pendingLoads.delete(path);

          if (error || !asset) {
            reject(error ?? new Error(`[ResourceService] Resource not found: ${path}`));
            return;
          }

          this.cache.set(path, asset);
          resolve(asset);
        });
      }))
      .catch((error) => {
        this.pendingLoads.delete(path);
        throw error;
      });

    this.pendingLoads.set(path, loadPromise);
    return loadPromise;
  }

  preload<T extends Asset>(path: string, type: AssetConstructor<T>): Promise<void> {
    if (this.cache.has(path)) {
      return Promise.resolve();
    }

    return this.getBundle().then((bundle) => new Promise<void>((resolve, reject) => {
      bundle.preload(path, type, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    }));
  }

  async preloadAll<T extends Asset>(paths: readonly string[], type: AssetConstructor<T>): Promise<void> {
    await Promise.all(paths.map((path) => this.preload(path, type)));
  }

  loadPrefab(path: string): Promise<Prefab> {
    return this.load(path, Prefab);
  }

  async instantiatePrefab(path: string): Promise<Node> {
    const prefab = await this.loadPrefab(path);
    return instantiate(prefab);
  }

  loadJson(path: string): Promise<JsonAsset> {
    return this.load(path, JsonAsset);
  }

  loadTexture(path: string): Promise<Texture2D> {
    return this.load(path, Texture2D);
  }

  loadSpriteFrame(path: string): Promise<SpriteFrame> {
    return this.load(path, SpriteFrame);
  }

  has(path: string): boolean {
    return this.cache.has(path);
  }

  release(path: string): void {
    if (!this.cache.has(path)) {
      return;
    }

    this.cache.delete(path);
    this.bundle?.release(path);
  }

  clear(): void {
    for (const path of this.cache.keys()) {
      this.bundle?.release(path);
    }

    this.cache.clear();
    this.pendingLoads.clear();
  }

  private getBundle(): Promise<AssetManager.Bundle> {
    if (this.bundle) {
      return Promise.resolve(this.bundle);
    }

    if (this.pendingBundle) {
      return this.pendingBundle;
    }

    this.pendingBundle = new Promise<AssetManager.Bundle>((resolve, reject) => {
      assetManager.loadBundle(ResourceService.ResourcesBundleName, (error, bundle) => {
        this.pendingBundle = null;

        if (error || !bundle) {
          reject(error ?? new Error(`[ResourceService] Bundle not found: ${ResourceService.ResourcesBundleName}`));
          return;
        }

        this.bundle = bundle;
        resolve(bundle);
      });
    });

    return this.pendingBundle;
  }
}
