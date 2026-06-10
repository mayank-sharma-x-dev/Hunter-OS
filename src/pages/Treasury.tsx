import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import {
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, DollarSign,
  PiggyBank, Receipt, Filter, Target, Minus, Pencil, Check,
} from "lucide-react";
import { ChillPageLayout, fadeUp, scaleUp } from "@/components/ChillPageLayout";
import { soundManager } from "@/lib/sounds";

const CATEGORIES = [
  { name: "Food", emoji: "🍔" },
  { name: "Transport", emoji: "🚗" },
  { name: "Entertainment", emoji: "🎮" },
  { name: "Shopping", emoji: "🛍️" },
  { name: "Bills", emoji: "📄" },
  { name: "Salary", emoji: "💰" },
  { name: "Freelance", emoji: "💻" },
  { name: "Education", emoji: "📚" },
  { name: "Health", emoji: "🏥" },
  { name: "Other", emoji: "📌" },
];

const PIE_COLORS = [
  "hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))",
  "hsl(var(--destructive))", "hsl(var(--gold))", "hsl(190, 50%, 55%)",
  "hsl(260, 50%, 55%)", "hsl(30, 70%, 55%)", "hsl(340, 50%, 55%)", "hsl(160, 50%, 45%)",
];

const Treasury = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const {
    transactions, loading: txLoading, addTransaction, deleteTransaction,
    getBalance, getTotalIncome, getTotalExpenses,
  } = useTransactions();

  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  // Monthly budget (stored locally)
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem("monthlyBudget");
    return saved ? parseFloat(saved) : 0;
  });
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget || ""));

  // Quick-add expense
  const [quickTitle, setQuickTitle] = useState("");
  const [quickAmount, setQuickAmount] = useState("");

  useEffect(() => {
    localStorage.setItem("monthlyBudget", String(monthlyBudget));
  }, [monthlyBudget]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (!loading && !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;
    soundManager.playClick();
    await addTransaction(newTitle, parseFloat(newAmount), newType, newCategory);
    setNewTitle(""); setNewAmount(""); setNewCategory("");
  };

  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();

  // This month's expenses
  const now = new Date();
  const monthExpenses = transactions
    .filter(t => t.type === "expense")
    .filter(t => {
      const d = new Date(t.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((s, t) => s + Number(t.amount), 0);

  const budgetRemaining = monthlyBudget - monthExpenses;
  const budgetPct = monthlyBudget > 0 ? Math.min(100, (monthExpenses / monthlyBudget) * 100) : 0;
  const overBudget = monthlyBudget > 0 && monthExpenses > monthlyBudget;

  const adjustBudget = (delta: number) => {
    setMonthlyBudget((b) => Math.max(0, +(b + delta).toFixed(2)));
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(quickAmount);
    if (!quickTitle.trim() || isNaN(amt) || amt <= 0) return;
    soundManager.playClick();
    await addTransaction(quickTitle.trim(), amt, "expense", "Other");
    setQuickTitle("");
    setQuickAmount("");
  };

  const chartData = (() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayTx = transactions.filter(t => startOfDay(new Date(t.created_at)).getTime() === dayStart.getTime());
      return {
        date: format(day, "MMM dd"),
        income: dayTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: dayTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    });
  })();

  const categoryData = (() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      const cat = t.category || "Other";
      map[cat] = (map[cat] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  })();

  const filteredTransactions = transactions.filter(t => filterType === "all" || t.type === filterType);

  return (
    <ChillPageLayout
      title="Treasury"
      subtitle="Track income, expenses & manage your finances"
      icon={<Wallet className="w-7 h-7 text-gold" />}
      accentColor="gold"
    >
      {/* Balance Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <DollarSign className="w-6 h-6 text-gold" />, label: "Total Balance", value: `$${balance.toFixed(2)}`, color: balance >= 0 ? "text-accent" : "text-destructive", border: "border-gold/15" },
          { icon: <TrendingUp className="w-6 h-6 text-accent" />, label: "Total Income", value: `$${totalIncome.toFixed(2)}`, color: "text-accent", border: "border-accent/15" },
          { icon: <TrendingDown className="w-6 h-6 text-destructive" />, label: "Total Expenses", value: `$${totalExpenses.toFixed(2)}`, color: "text-destructive", border: "border-destructive/15" },
        ].map((card, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <Card className={`${card.border} bg-card/60 backdrop-blur-sm`}>
              <CardContent className="p-5 text-center">
                <div className="flex justify-center mb-2">{card.icon}</div>
                <p className="text-[10px] text-muted-foreground font-ui uppercase tracking-widest">{card.label}</p>
                <p className={`font-game text-2xl md:text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Monthly Budget */}
      <motion.div variants={fadeUp} className="mb-6">
        <Card className={`bg-card/60 backdrop-blur-sm ${overBudget ? "border-destructive/40" : "border-primary/20"}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Target className={`w-5 h-5 ${overBudget ? "text-destructive" : "text-primary"}`} />
                <span className="font-game text-sm tracking-wide text-foreground">Monthly Budget</span>
              </div>

              {editingBudget ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="0.00"
                    className="h-8 w-28 text-sm bg-background/50 border-border/30"
                    step="0.01"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-primary text-primary-foreground"
                    onClick={() => {
                      const v = parseFloat(budgetInput);
                      setMonthlyBudget(isNaN(v) ? 0 : Math.max(0, v));
                      setEditingBudget(false);
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => adjustBudget(-50)} title="-50">
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <button
                    onClick={() => { setBudgetInput(String(monthlyBudget || "")); setEditingBudget(true); }}
                    className="font-game text-lg text-foreground px-2 hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    ${monthlyBudget.toFixed(2)} <Pencil className="w-3 h-3 opacity-60" />
                  </button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => adjustBudget(50)} title="+50">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {monthlyBudget > 0 ? (
              <>
                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${overBudget ? "bg-destructive" : "bg-primary"}`}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-ui">
                  <span className="text-muted-foreground">
                    Spent <span className="text-destructive font-semibold">${monthExpenses.toFixed(2)}</span> of ${monthlyBudget.toFixed(2)}
                  </span>
                  <span className={overBudget ? "text-destructive font-semibold" : "text-accent font-semibold"}>
                    {overBudget ? `Over by $${Math.abs(budgetRemaining).toFixed(2)}` : `$${budgetRemaining.toFixed(2)} left`}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground font-ui">Set a budget to track your monthly spending.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Add Expense */}
      <motion.div variants={fadeUp} className="mb-6">
        <Card className="border-destructive/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="font-game text-sm tracking-wide text-foreground">Quick Add Expense</span>
            </div>
            <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="What did you spend on?"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1 bg-background/50 font-ui border-border/30"
              />
              <Input
                type="number"
                placeholder="Amount"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                className="sm:w-32 bg-background/50 font-ui border-border/30"
                step="0.01"
                min="0"
              />
              <Button
                type="submit"
                className="sm:w-auto font-ui bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Plus className="w-4 h-4 mr-1" /> Add ${quickAmount && !isNaN(parseFloat(quickAmount)) ? parseFloat(quickAmount).toFixed(2) : "0.00"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={scaleUp}>
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-game text-sm flex items-center gap-2 text-foreground">
                  <Receipt className="w-4 h-4 text-primary" /> 7-Day Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="income" stroke="hsl(var(--accent))" fill="url(#incGrad)" strokeWidth={2} name="Income" />
                      <Area type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" fill="url(#expGrad)" strokeWidth={2} name="Expense" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {categoryData.length > 0 && (
            <motion.div variants={scaleUp}>
              <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-game text-sm flex items-center gap-2 text-foreground">
                    <PiggyBank className="w-4 h-4 text-gold" /> Spending by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                            {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {categoryData.map((cat, i) => {
                        const catInfo = CATEGORIES.find(c => c.name === cat.name);
                        return (
                          <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-background/30">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-sm font-ui">{catInfo?.emoji} {cat.name}</span>
                            </div>
                            <span className="text-sm font-game text-destructive">${cat.value.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right: Add + History */}
        <div className="space-y-6">
          <motion.div variants={scaleUp}>
            <Card className="border-gold/15 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-game text-sm flex items-center gap-2 text-gold">
                  <Plus className="w-4 h-4" /> Add Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input placeholder="What did you spend on?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-background/50 font-ui border-border/30" />
                  <Input type="number" placeholder="Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="bg-background/50 font-ui border-border/30" step="0.01" />
                  <Select value={newType} onValueChange={(v: "income" | "expense") => setNewType(v)}>
                    <SelectTrigger className="bg-background/50 font-ui border-border/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">💸 Expense</SelectItem>
                      <SelectItem value="income">💰 Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="bg-background/50 font-ui border-border/30"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full font-ui bg-gold text-gold-foreground hover:bg-gold/90 shadow-lg shadow-gold/20">
                    <Plus className="w-4 h-4 mr-2" /> Add Entry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleUp}>
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-game text-sm flex items-center gap-2 text-foreground">
                    <Receipt className="w-4 h-4 text-muted-foreground" /> History
                  </CardTitle>
                  <Select value={filterType} onValueChange={(v: "all" | "income" | "expense") => setFilterType(v)}>
                    <SelectTrigger className="w-28 h-8 text-xs bg-background/50 border-border/30">
                      <Filter className="w-3 h-3 mr-1" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredTransactions.map(t => {
                    const catInfo = CATEGORIES.find(c => c.name === t.category);
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/20 group hover:border-border/40 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${t.type === "income" ? "bg-accent/10" : "bg-destructive/10"}`}>
                            {catInfo?.emoji || (t.type === "income" ? "💰" : "💸")}
                          </div>
                          <div className="min-w-0">
                            <p className="font-ui text-sm font-medium truncate">{t.title}</p>
                            <p className="text-[10px] text-muted-foreground">{t.category && `${t.category} • `}{format(new Date(t.created_at), "MMM dd, HH:mm")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-game text-sm ${t.type === "income" ? "text-accent" : "text-destructive"}`}>
                            {t.type === "income" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                          </span>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" onClick={() => { soundManager.playClick(); deleteTransaction(t.id); }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-ui text-sm">No transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ChillPageLayout>
  );
};

export default Treasury;
