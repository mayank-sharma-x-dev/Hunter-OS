export interface ExportData {
  tasks: any[];
  goals: any[];
  achievements: any[];
  transactions: any[];
  level: number;
  exp: number;
  tasksCompleted: number;
  exportedAt: string;
}

export const exportToJSON = (data: Omit<ExportData, 'exportedAt'>) => {
  const exportData: ExportData = {
    ...data,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  downloadFile(blob, `solo-leveling-backup-${formatDate()}.json`);
};

export const exportToCSV = (data: Omit<ExportData, 'exportedAt'>) => {
  const sections: string[] = [];

  // Summary section
  sections.push("=== SUMMARY ===");
  sections.push(`Level,${data.level}`);
  sections.push(`EXP,${data.exp}`);
  sections.push(`Tasks Completed,${data.tasksCompleted}`);
  sections.push("");

  // Tasks section
  sections.push("=== TASKS ===");
  sections.push("ID,Text,Completed,Date");
  data.tasks.forEach((task) => {
    sections.push(
      `${task.id},"${escapeCsv(task.text)}",${task.completed},${task.date}`
    );
  });
  sections.push("");

  // Goals section
  sections.push("=== GOALS ===");
  sections.push("ID,Title,Description,Progress,Category");
  data.goals.forEach((goal) => {
    sections.push(
      `${goal.id},"${escapeCsv(goal.title)}","${escapeCsv(goal.description || "")}",${goal.progress},${goal.category}`
    );
  });
  sections.push("");

  // Transactions section
  sections.push("=== TRANSACTIONS ===");
  sections.push("ID,Type,Amount,Category,Description,Date");
  data.transactions.forEach((t) => {
    sections.push(
      `${t.id},${t.type},${t.amount},"${escapeCsv(t.category)}","${escapeCsv(t.description || "")}",${t.date}`
    );
  });

  const blob = new Blob([sections.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  downloadFile(blob, `solo-leveling-backup-${formatDate()}.csv`);
};

const escapeCsv = (str: string): string => {
  return str.replace(/"/g, '""');
};

const formatDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
