declare function require(name: string): unknown;

export type Images = ResolveType<ReturnType<typeof loadImages>>;

export async function loadImages() {
  return await loadAll(assetLoaders);
};

let assetLoaders = requestImages({
  ball: require('./assets/blueball.png'),
});

type ImagePromise = Promise<HTMLImageElement>;

type ResolveType<T> = T extends Promise<infer Resolve> ? Resolve : T;

async function loadAll<Spec>(
  spec: {[P in keyof Spec]: Promise<Spec[P]>},
): Promise<Spec> {
  return (Object as any).fromEntries(
    await Promise.all(Object.entries(spec).map(async ([name, promise]) => {
      return [name, await promise];
    })),
  );
}

function requestImage(path: string): ImagePromise {
  return new Promise(resolve => {
    let image = new Image;
    image.onload = () => resolve(image);
    image.src = path;
  });
}

function requestImages<Spec>(spec: Spec): {[P in keyof Spec]: ImagePromise} {
  return (Object as any).fromEntries(
    Object.entries(spec).map(([name, result]) => {
      let path = result as string;
      return [name, requestImage(path)] as [string, ImagePromise];
    }),
  );
}
