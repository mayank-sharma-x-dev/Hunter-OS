import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  DollarSign,
} from "lucide-react";

const CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Bills",
  "Salary",
  "Freelance",
  "Other",
];

export const TreasuryPanel = () => {
  const {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getBalance,
    getTotalIncome,
    getTotalExpenses,
  } = useTransactions();

  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    await addTransaction(
      newTitle,
      parseFloat(newAmount),
      newType,
      newCategory
    );
    setNewTitle("");
    setNewAmount("");
    setNewCategory("");
  };

  // Prepare chart data - last 7 days
  const getChartData = () => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayTransactions = transactions.filter((t) => {
        const tDate = startOfDay(new Date(t.created_at));
        return tDate.getTime() === dayStart.getTime();
      });

      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const expense = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      return {
        date: format(day, "MMM dd"),
        income,
        expense,
        net: income - expense,
      };
    });
  };

  const chartData = getChartData();
  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();

  if (loading) {
    return (
      <Card className="card-anime">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-anime border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-gold font-game">
          <Wallet className="w-5 h-5" />
          TREASURY
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <DollarSign className="w-4 h-4 mx-auto text-gold mb-1" />
            <p className="text-xs text-muted-foreground">Balance</p>
            <p
              className={`font-bold ${
                balance >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto text-green-400 mb-1" />
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="font-bold text-green-400">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <TrendingDown className="w-4 h-4 mx-auto text-red-400 mb-1" />
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                fill="url(#incomeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                fill="url(#expenseGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Add Transaction Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-background/50 text-sm"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="bg-background/50 text-sm w-24"
              step="0.01"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={newType}
              onValueChange={(v: "income" | "expense") => setNewType(v)}
            >
              <SelectTrigger className="bg-background/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="bg-background/50 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="sm" className="bg-gold text-background">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Recent Transactions */}
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {transactions.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-background/30 rounded p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {t.type === "income" ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className="truncate max-w-[100px]">{t.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    t.type === "income" ? "text-green-400" : "text-red-400"
                  }
                >
                  {t.type === "income" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                  onClick={() => deleteTransaction(t.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              No transactions yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
