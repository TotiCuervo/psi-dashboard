'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
    onFileSelected: (file: File) => void
    confirmed: boolean
    fileName?: string
}

export function FileUploadZone({ onFileSelected, confirmed, fileName }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) onFileSelected(file)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onFileSelected(file)
    }

    return (
        <div
            data-testid="upload__dropzone"
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={[
                'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-8 py-10 cursor-pointer transition-colors',
                dragging ? 'border-foreground bg-muted/40' : 'border-border hover:border-muted-foreground/50 hover:bg-muted/20',
            ].join(' ')}
        >
            <Input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleChange}
                data-testid="upload__input"
            />

            {confirmed && fileName ? (
                <div className="flex items-center gap-2 text-sm" data-testid="upload__confirmed">
                    <svg className="size-4 text-green-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-foreground truncate max-w-xs">{fileName}</span>
                </div>
            ) : (
                <>
                    <svg className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Upload master Excel file</p>
                        <p className="text-xs text-muted-foreground mt-1">.xlsx only — drag &amp; drop or click to browse</p>
                    </div>
                </>
            )}

            {confirmed && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                    data-testid="upload__replace"
                >
                    Replace file
                </Button>
            )}
        </div>
    )
}
