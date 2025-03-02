export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export function prepareHash(source: string): string {
    return source
        .replaceAll(' ', '-')
        .replaceAll(/[^\w-]/gi, '')
        .toLowerCase()
}

/**
 * Obtains a portion of a `SHA-256` hash from the data.
 */
export async function getHash(data: string): Promise<string> {
    // createHash is not defined on android
    // return createHash('sha256').update(data).digest('hex').substring(0, 64)
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(data)
    const hashBytes = await crypto.subtle.digest('SHA-1', encodedData)
    const hashArray = new Uint8Array(hashBytes)
    const hashString = Array.from(hashArray)
        .map((byte) => byte.toString(16).padStart(2, '0')) // hex
        .join('')
    return hashString
}
