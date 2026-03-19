'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

type Props = {
    onFileSelected: (file: File) => void
    fileName?: string
    accept?: string           // e.g. ".xlsx" or ".csv"
    label?: string            // primary drop zone label
    hint?: string             // secondary hint text
    testId?: string           // data-testid prefix
}

export function FileUploadZone({
    onFileSelected,
    fileName,
    accept = '.xlsx',
    label = 'Drop your Excel file here',
    hint = '.xlsx only · click to browse',
    testId = 'upload',
}: Props) {
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
            data-testid={`${testId}__dropzone`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
                'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-10 cursor-pointer transition-colors',
                dragging
                    ? 'border-foreground bg-muted/60'
                    : fileName
                        ? 'border-border bg-muted/30 hover:bg-muted/50'
                        : 'border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/20'
            )}
        >
            <Input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleChange}
                data-testid={`${testId}__input`}
            />

            {fileName ? (
                <div className="flex flex-col items-center gap-2 text-center" data-testid={`${testId}__confirmed`}>
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <svg className="size-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[280px]">{fileName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Click to replace</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <svg className="size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
