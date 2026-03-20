import { parseOrders } from '@/lib/parseOrders'

export async function POST(req: Request) {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return Response.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    if (!file.name.endsWith('.xlsx')) {
        return Response.json({ error: 'Only .xlsx files are supported.' }, { status: 400 })
    }

    try {
        const result = parseOrders(await file.arrayBuffer())
        return Response.json(result)
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to parse file.'
        return Response.json({ error: message }, { status: 400 })
    }
}
