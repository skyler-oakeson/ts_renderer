export async function loadModel(file: string) {
    const res = await fetch(`./models/${file}`);
    const text = await res.text();
    return text
}
