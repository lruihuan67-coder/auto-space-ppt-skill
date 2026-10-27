import { useEffect, useState } from "react"
import {
  Activity,
  ArrowRight,
  Check,
  CircleHelp,
  Database,
  Factory,
  Layers3,
  LayoutDashboard,
  Moon,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Workflow,
} from "lucide-react"

import { AiJobCard } from "@/components/ui/ai-job-card"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox, Radio, Switch } from "@/components/ui/choice"
import { DataTable } from "@/components/ui/data-table"
import { Dialog } from "@/components/ui/dialog"
import { EmptyState, Progress, Skeleton } from "@/components/ui/feedback"
import { Field, Input, Select, Textarea } from "@/components/ui/form-field"
import { MetricCard } from "@/components/ui/metric-card"
import { Tabs } from "@/components/ui/tabs"
import { MarketingHero } from "@/components/patterns/marketing-hero"
import { cn } from "@/lib/utils"

type View = "components" | "dashboard" | "marketing"

const views = [
  { id: "components", label: "基础组件", icon: Layers3 },
  { id: "dashboard", label: "AI 产品示例", icon: LayoutDashboard },
  { id: "marketing", label: "官网模块示例", icon: Palette },
] as const

const colors = [
  { name: "凹凸蓝", hex: "#245CB5", use: "主操作与品牌识别", darkText: false },
  { name: "电光蓝", hex: "#0D7CFD", use: "交互高亮", darkText: false },
  { name: "天际蓝", hex: "#00AAFF", use: "数字信息", darkText: true },
  { name: "跃动橙", hex: "#F74C25", use: "关键行动", darkText: true },
  { name: "暖光黄", hex: "#FAB02F", use: "积极反馈", darkText: true },
] as const

const demoRows = [
  { id: "AS-001", name: "设备巡检知识库", kind: "知识检索", state: "运行中", owner: "示例项目 A" },
  { id: "AS-002", name: "工业文档智能解析", kind: "文档处理", state: "已完成", owner: "示例项目 B" },
  { id: "AS-003", name: "生产数据异常分析", kind: "数据分析", state: "排队中", owner: "示例项目 C" },
]

function SectionTitle({ number, title, description }: { number: string; title: string; description?: string }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 font-mono text-xs font-semibold tracking-[0.2em] text-[var(--as-primary)]">{number}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--as-text)]">{title}</h2>
      </div>
      {description && <p className="max-w-xl text-sm leading-6 text-[var(--as-muted)]">{description}</p>}
    </div>
  )
}

function ComponentPage({ onOpenDialog }: { onOpenDialog: () => void }) {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--as-border)] bg-[var(--as-surface)] px-7 py-10 sm:px-10">
        <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full bg-[#00AAFF]/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <Badge variant="primary" dot>DESIGN SYSTEM · v0.1</Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--as-text)] sm:text-4xl">凹凸时空品牌 UI 组件库</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--as-muted)]">
            为企业 AI 产品与对外页面建立统一、可复用的界面语言。这里的组件均有 React + TypeScript 源码，支持 Tailwind 与明暗主题。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>React</Badge><Badge>TypeScript</Badge><Badge>Tailwind CSS</Badge><Badge>键盘可用</Badge>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle number="01 / FOUNDATIONS" title="品牌色与语义角色" description="主蓝承担主操作；蓝色系表达数字信息；橙与黄只用于有明确意义的强调。" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {colors.map((color) => (
            <div key={color.hex} className="overflow-hidden rounded-2xl border border-[var(--as-border)] bg-[var(--as-surface)]">
              <div className="flex h-32 flex-col justify-between p-4" style={{ background: color.hex, color: color.darkText ? "#0A1B31" : "#fff" }}>
                <span className="text-base font-semibold">{color.name}</span>
                <span className="font-mono text-sm font-semibold">{color.hex}</span>
              </div>
              <p className="px-4 py-3 text-xs text-[var(--as-muted)]">{color.use}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[{ name: "深空墨", hex: "#102541" }, { name: "雾蓝灰", hex: "#62748B" }, { name: "浅纸白", hex: "#F2F6FC" }].map((color) => (
            <div key={color.name} className="flex items-center gap-3 rounded-xl border border-[var(--as-border)] bg-[var(--as-surface)] px-4 py-3">
              <span className="size-7 rounded-md border border-[var(--as-border)]" style={{ background: color.hex }} />
              <span className="text-sm font-medium text-[var(--as-text)]">{color.name}</span>
              <span className="ml-auto font-mono text-xs text-[var(--as-muted)]">{color.hex}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle number="02 / ACTIONS & INPUTS" title="操作与表单" description="统一尺寸、聚焦态、禁用态和错误提示，保留原生表单语义。" />
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>按钮 Button</CardTitle><CardDescription>主次操作与常见状态</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button leftIcon={<Sparkles size={16} />}>开始使用</Button>
              <Button variant="secondary">次要操作</Button>
              <Button variant="outline">描边按钮</Button>
              <Button variant="ghost">文字操作</Button>
              <Button variant="link">了解更多</Button>
              <Button disabled>不可点击</Button>
              <Button loading>处理中</Button>
              <Button variant="danger" size="sm">删除</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>输入 Input / Select</CardTitle><CardDescription>示例内容仅用于检验中文布局</CardDescription></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field id="demo-name" label="企业名称" required hint="用于方案沟通，不会在页面公开"><Input placeholder="请输入企业名称" /></Field>
              <Field id="demo-industry" label="所属行业"><Select defaultValue="" placeholder="请选择行业"><option value="manufacturing">智能制造</option><option value="energy">能源</option><option value="other">其他</option></Select></Field>
              <Field id="demo-query" label="检索关键词" error="请输入至少两个字"><Input placeholder="例如：设备巡检" /></Field>
              <Field id="demo-description" label="需求描述"><Textarea placeholder="简要描述希望引入 AI 的业务场景" rows={2} /></Field>
            </CardContent>
          </Card>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>选择 Choice</CardTitle><CardDescription>原生键盘交互与可见标签</CardDescription></CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Checkbox label="启用消息通知" defaultChecked description="任务完成后显示通知" />
              <Switch label="自动生成摘要" defaultChecked description="可随时在设置中调整" />
              <Radio name="mode" label="标准模式" defaultChecked />
              <Radio name="mode" label="高级模式" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>状态 Badge</CardTitle><CardDescription>品牌点缀与业务状态分开命名</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="primary" dot>品牌</Badge><Badge variant="info" dot>信息</Badge>
              <Badge variant="success" dot>成功</Badge><Badge variant="warning" dot>警告</Badge>
              <Badge variant="danger" dot>错误</Badge><Badge variant="orange" dot>重点行动</Badge>
              <Badge variant="yellow" dot>积极反馈</Badge><Badge variant="neutral" dot>默认</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <SectionTitle number="03 / FEEDBACK & NAVIGATION" title="反馈与导航" description="让提示、载入和内容切换保持同一视觉语法。" />
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>提示 Alert</CardTitle><CardDescription>信息、成功、警告、错误</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Alert title="知识库已就绪" variant="info">可以开始导入文档并测试检索效果。</Alert>
              <Alert title="任务已完成" variant="success">演示任务的结果已可查看。</Alert>
              <Alert title="需要检查文件格式" variant="warning">请确认上传文件满足当前流程要求。</Alert>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>标签页 Tabs</CardTitle><CardDescription>支持方向键、Home、End 与焦点切换</CardDescription></CardHeader>
            <CardContent>
              <Tabs items={[
                { value: "overview", label: "概览", content: <p className="text-sm leading-7 text-[var(--as-muted)]">用少量层级展现业务概况，主蓝用于当前选中状态。</p> },
                { value: "data", label: "数据", content: <p className="text-sm leading-7 text-[var(--as-muted)]">可在此放置表格、指标与可视化组件。</p> },
                { value: "settings", label: "设置", content: <p className="text-sm leading-7 text-[var(--as-muted)]">表单控件沿用同一组聚焦与错误态。</p> },
              ]} />
              <Button variant="outline" size="sm" onClick={onOpenDialog}>打开 Dialog 示例</Button>
            </CardContent>
          </Card>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <EmptyState icon={<Search size={30} />} title="暂无检索结果" description="试试更宽泛的关键词，或先为知识库添加文档。" action={<Button size="sm">添加文档</Button>} />
          <Card><CardTitle>进度 Progress</CardTitle><CardContent className="space-y-6"><Progress value={68} label="文档解析" showValue /><Progress value={34} label="模型评估" showValue /></CardContent></Card>
          <Card><CardTitle>加载 Skeleton</CardTitle><CardContent className="space-y-3"><Skeleton className="h-5 w-2/3" /><Skeleton /><Skeleton className="w-4/5" /></CardContent></Card>
        </div>
      </section>
    </div>
  )
}

function DashboardPage() {
  const columns = [
    { id: "id", header: "编号", cell: (row: (typeof demoRows)[number]) => <span className="font-mono text-xs text-[var(--as-muted)]">{row.id}</span> },
    { id: "name", header: "任务名称", cell: (row: (typeof demoRows)[number]) => <span className="font-medium">{row.name}</span> },
    { id: "kind", header: "能力类型", cell: (row: (typeof demoRows)[number]) => row.kind },
    { id: "state", header: "状态", cell: (row: (typeof demoRows)[number]) => <Badge variant={row.state === "已完成" ? "success" : row.state === "运行中" ? "info" : "neutral"} dot>{row.state}</Badge> },
    { id: "owner", header: "项目", cell: (row: (typeof demoRows)[number]) => row.owner },
  ]
  const barValues = [32, 51, 44, 69, 55, 81, 67, 88, 73, 94, 79, 84]

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Badge variant="primary">AI PRODUCT PATTERN</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--as-text)]">AI 工作台示例</h1><p className="mt-2 text-sm text-[var(--as-muted)]">指标与任务名称均为演示数据，用于验证组件组合和中文排版。</p></div>
        <Button leftIcon={<Sparkles size={16} />}>创建 AI 任务</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="运行中任务" value="08" detail="示例数据 · 当前批次" icon={<Activity size={20} />} />
        <MetricCard label="已接入知识库" value="12" detail="示例数据 · 可复用资源" accent="sky" icon={<Database size={20} />} />
        <MetricCard label="待处理提醒" value="03" detail="示例数据 · 需人工确认" accent="orange" icon={<CircleHelp size={20} />} />
        <MetricCard label="已完成流程" value="24" detail="示例数据 · 本期汇总" accent="yellow" icon={<Check size={20} />} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardHeader><CardTitle>任务处理趋势</CardTitle><CardDescription>图表仅演示品牌色、网格和信息层级</CardDescription></CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-3 border-b border-[var(--as-border)] px-2 pb-2">
              {barValues.map((height, index) => <div key={index} className={cn("min-w-0 flex-1 rounded-t-md", index === 9 ? "bg-[#00AAFF]" : "bg-[#245CB5]")} style={{ height: `${height}%`, opacity: index === 9 ? 1 : 0.55 + index * 0.03 }} />)}
            </div>
            <div className="mt-3 flex justify-between text-xs text-[var(--as-muted)]"><span>第 1 周</span><span>第 2 周</span><span>第 3 周</span><span>第 4 周</span></div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <AiJobCard title="设备巡检报告生成" description="结合设备文档与巡检记录，生成待审核的结构化摘要。" project="示例项目 A" status="running" progress={68} updatedAt="演示数据" onOpen={() => {}} />
          <AiJobCard title="文档解析批次" description="部分文件需重新上传后再试。" project="示例项目 B" status="failed" updatedAt="演示数据" onRetry={() => {}} />
        </div>
      </div>
      <section><SectionTitle number="DATA TABLE" title="任务列表" description="表格包含明确表头、空态和横向滚动处理。" /><DataTable columns={columns} data={demoRows} getRowId={(row) => row.id} caption="AI 任务示例列表" /></section>
    </div>
  )
}

function MarketingPage() {
  return (
    <div className="space-y-10 pb-20">
      <div><Badge variant="primary">MARKETING PATTERN</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--as-text)]">官网与对外宣发示例</h1><p className="mt-2 text-sm text-[var(--as-muted)]">真实品牌定位配合可替换的模块结构，不包含虚构客户或业绩。</p></div>
      <MarketingHero
        eyebrow="AUTO SPACE  /  INDUSTRIAL AI"
        title="AI 改变行业未来"
        description="凹凸时空以人工智能技术为核心驱动力，面向希望实现 AI 转型的企业，提供从技术研发到场景落地的解决方案。"
        primaryAction={<Button className="bg-white text-[#102541] hover:bg-slate-100" rightIcon={<ArrowRight size={16} />}>了解解决方案</Button>}
        secondaryAction={<Button variant="outline" className="border-white/40 bg-white/5 text-white hover:bg-white/15">联系我们</Button>}
      />
      <section>
        <SectionTitle number="CAPABILITY MODULES" title="能力介绍模块" description="卡片用于清晰表达能力边界，不依赖华丽装饰。" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: <Factory size={25} />, label: "工业场景", title: "从业务问题出发", body: "围绕真实业务流程识别 AI 可落地的环节，让方案与生产和运营场景紧密结合。", color: "#245CB5" },
            { icon: <Database size={25} />, label: "数据与知识", title: "让信息形成能力", body: "通过数据处理与知识组织，为智能检索、分析和辅助决策提供基础。", color: "#00AAFF" },
            { icon: <Workflow size={25} />, label: "交付流程", title: "从研发到场景应用", body: "以可验证、可迭代的流程推进方案设计、实施与持续优化。", color: "#F74C25" },
          ].map((item) => (
            <Card key={item.title} className="min-h-64">
              <div className="mb-7 flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-xl bg-[var(--as-surface-alt)] text-[var(--as-primary)]">{item.icon}</span><span className="size-2.5 rounded-full" style={{ background: item.color }} /></div>
              <p className="text-xs font-semibold tracking-[0.12em] text-[var(--as-primary)]">{item.label}</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--as-text)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--as-muted)]">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-[var(--as-border)] bg-[var(--as-surface)] px-7 py-8 sm:px-10">
        <div><p className="text-xs font-semibold tracking-[0.2em] text-[var(--as-primary)]">LET'S BUILD WITH AI</p><h2 className="mt-2 text-2xl font-semibold text-[var(--as-text)]">让 AI 进入实际业务场景</h2><p className="mt-2 text-sm text-[var(--as-muted)]">通过一次沟通，明确优先场景与可行路径。</p></div>
        <Button rightIcon={<ArrowRight size={16} />}>发起需求沟通</Button>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>("components")
  const [dark, setDark] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("auto-space-theme") === "dark")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    window.localStorage.setItem("auto-space-theme", dark ? "dark" : "light")
  }, [dark])

  return (
    <div className="min-h-screen bg-[var(--as-surface-alt)] text-[var(--as-text)] lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--as-border)] bg-[var(--as-surface)] lg:flex lg:flex-col">
        <div className="border-b border-[var(--as-border)] px-7 py-7">
          <img src={dark ? "/brand/wordmark-white.svg" : "/brand/wordmark-ink.svg"} alt="凹凸时空 AUTO SPACE" className="h-9 max-w-44 object-contain object-left" />
          <p className="mt-5 font-mono text-[10px] font-semibold tracking-[0.22em] text-[var(--as-muted)]">BRAND UI SYSTEM / 0.1</p>
        </div>
        <nav aria-label="组件库导航" className="space-y-1 px-3 py-7">
          <p className="px-4 pb-3 text-xs font-medium text-[var(--as-muted)]">设计资源</p>
          {views.map((item) => <button key={item.id} type="button" onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined} className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors", view === item.id ? "bg-[var(--as-surface-alt)] text-[var(--as-primary)]" : "text-[var(--as-muted)] hover:bg-[var(--as-surface-alt)] hover:text-[var(--as-text)]")}><item.icon size={18} />{item.label}</button>)}
        </nav>
        <div className="mt-auto border-t border-[var(--as-border)] p-5"><div className="rounded-xl bg-[var(--as-surface-alt)] p-4"><p className="text-sm font-semibold">一套规则，两类界面</p><p className="mt-2 text-xs leading-5 text-[var(--as-muted)]">企业 AI 产品与品牌传播共享色彩、字体和交互语言。</p></div></div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-18 items-center justify-between gap-4 border-b border-[var(--as-border)] bg-[var(--as-surface)]/95 px-5 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3"><img src={dark ? "/brand/wordmark-white.svg" : "/brand/wordmark-ink.svg"} alt="凹凸时空 AUTO SPACE" className="h-7 max-w-32 object-contain object-left lg:hidden" /><span className="hidden text-sm font-medium text-[var(--as-muted)] lg:inline">凹凸时空 / 组件规范</span><span className="hidden text-[var(--as-border)] lg:inline">/</span><span className="truncate text-sm font-semibold">{views.find((item) => item.id === view)?.label}</span></div>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 text-xs text-[var(--as-muted)] sm:flex"><ShieldCheck size={15} /> 设计与代码同步</span><Button variant="ghost" size="icon" aria-label={dark ? "切换到浅色主题" : "切换到深色主题"} onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</Button></div>
        </header>
        <nav aria-label="移动端组件库导航" className="flex gap-2 overflow-x-auto border-b border-[var(--as-border)] bg-[var(--as-surface)] px-4 py-3 lg:hidden">{views.map((item) => <button key={item.id} type="button" onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined} className={cn("shrink-0 rounded-lg px-3 py-2 text-sm", view === item.id ? "bg-[var(--as-primary)] text-white" : "text-[var(--as-muted)]")}>{item.label}</button>)}</nav>
        <main className="mx-auto max-w-[1480px] px-5 pt-8 sm:px-8 sm:pt-10">
          {view === "components" && <ComponentPage onOpenDialog={() => setDialogOpen(true)} />}
          {view === "dashboard" && <DashboardPage />}
          {view === "marketing" && <MarketingPage />}
        </main>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="创建演示任务" description="这是组件交互预览，不会提交数据。" footer={<><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={() => setDialogOpen(false)}>确认</Button></>}>
        <Field id="dialog-task-name" label="任务名称" required><Input autoFocus placeholder="例如：设备巡检分析" /></Field>
      </Dialog>
    </div>
  )
}
