"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Download, Copy, Code, Moon, Sun, Share2 } from "lucide-react"
import { useTheme } from "next-themes"
import mermaid from "mermaid"

export default function MermaidEditor() {
  const [code, setCode] = useState<string>(
    `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> B`,
  )
  const [svg, setSvg] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    })
    renderDiagram()

    // Prevent page scrolling when using the mouse wheel in the preview area
    const preventScroll = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest(".overflow-hidden")) {
        e.preventDefault()
      }
    }

    document.addEventListener("wheel", preventScroll, { passive: false })
    return () => document.removeEventListener("wheel", preventScroll)
  }, [code, theme])

  const renderDiagram = async () => {
    try {
      const { svg } = await mermaid.render("mermaid-diagram", code)
      setSvg(svg)
    } catch (error) {
      console.error("Failed to render diagram:", error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diagram.svg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const examples = {
    flowchart: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`,
    sequence: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!`,
    classDiagram: `classDiagram
    class Animal {
      +name: string
      +eat(): void
      +sleep(): void
    }
    class Dog {
      +bark(): void
    }
    Animal <|-- Dog`,
    gantt: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2023-01-01, 30d
    Another task     :after a1, 20d
    section Another
    Task in sec      :2023-01-12, 12d
    another task     :24d`,
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mermaid Editor</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard()}>
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadSvg}>
            <Download className="h-4 w-4 mr-2" />
            Export SVG
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-2 border-b flex justify-between items-center">
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Editor</span>
              </div>
              <div className="flex gap-2">
                <Tabs defaultValue="flowchart" className="w-full">
                  <TabsList className="grid grid-cols-4 h-8">
                    <TabsTrigger value="flowchart" onClick={() => setCode(examples.flowchart)}>
                      Flowchart
                    </TabsTrigger>
                    <TabsTrigger value="sequence" onClick={() => setCode(examples.sequence)}>
                      Sequence
                    </TabsTrigger>
                    <TabsTrigger value="class" onClick={() => setCode(examples.classDiagram)}>
                      Class
                    </TabsTrigger>
                    <TabsTrigger value="gantt" onClick={() => setCode(examples.gantt)}>
                      Gantt
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm min-h-[400px] rounded-none border-0 resize-none focus-visible:ring-0"
              placeholder="Enter Mermaid syntax here..."
            />
          </Card>
        </div>

        <div>
          <Card className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-2 border-b flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                >
                  <span className="text-lg">-</span>
                </Button>
                <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((prev) => Math.min(2, prev + 0.1))}
                >
                  <span className="text-lg">+</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setZoom(1)
                    setPan({ x: 0, y: 0 })
                  }}
                >
                  <span className="text-xs">Reset</span>
                </Button>
              </div>
            </div>
            <div
              className="min-h-[400px] overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e] relative"
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
              onMouseDown={(e) => {
                setIsDragging(true)
                setDragStart({ x: e.clientX, y: e.clientY })
              }}
              onMouseMove={(e) => {
                if (isDragging) {
                  setPan((prev) => ({
                    x: prev.x + (e.clientX - dragStart.x),
                    y: prev.y + (e.clientY - dragStart.y),
                  }))
                  setDragStart({ x: e.clientX, y: e.clientY })
                }
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onWheel={(e) => {
                e.preventDefault()
                const delta = e.deltaY > 0 ? -0.1 : 0.1
                setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 2))
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 transform origin-center transition-transform duration-100 ease-linear"
                style={{
                  transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Mermaid Syntax Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Flowchart</h3>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {`graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Result]
    B -->|No| D[Another]`}
            </pre>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Sequence Diagram</h3>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {`sequenceDiagram
    Alice->>John: Hello John
    John-->>Alice: Hi Alice`}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  )
}

