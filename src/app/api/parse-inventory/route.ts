import { parseInventory } from '@/lib/parseInventory'

export async function POST(req: Request) {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return Response.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
        return Response.json({ error: 'Only .csv files are supported for inventory.' }, { status: 400 })
    }

    try {
        const text = await file.text()
        const result = parseInventory(text)
        return Response.json(result)
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to parse inventory file.'
        return Response.json({ error: message }, { status: 400 })
    }
}
