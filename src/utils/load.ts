export async function loadModel(file: string) {
    const res = await fetch(`./models/${file}`);
    const text = await res.text();
    return text
}

export async function loadTexture(file: string) {
    let asset = new Image();
    asset.src = `./textures/${file}`;
    await asset.decode();
    return asset
}
