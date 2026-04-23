import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and downloads a PDF report of all teams.
 * @param {Array} teams - Array of team objects from the API
 */
export function downloadTeamsPdf(teams) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Header ──
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("SLIIT SportSync", 14, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Team Management Report", 14, 23);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, doc.internal.pageSize.getWidth() - 14, 15, {
    align: "right",
  });
  doc.text(`Total teams: ${teams.length}`, doc.internal.pageSize.getWidth() - 14, 22, {
    align: "right",
  });

  // ── Summary stats ──
  const activeCount = teams.filter((t) => t.isActive !== false).length;
  const inactiveCount = teams.length - activeCount;
  const totalMembers = teams.reduce(
    (sum, t) => sum + (Array.isArray(t.members) ? t.members.length : 0),
    0
  );
  const sports = [...new Set(teams.map((t) => t.sportType).filter(Boolean))];

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);

  const statsY = 40;
  const statsData = [
    { label: "Active Teams", value: String(activeCount), color: [5, 150, 105] },
    { label: "Inactive Teams", value: String(inactiveCount), color: [107, 114, 128] },
    { label: "Total Players", value: String(totalMembers), color: [37, 99, 235] },
    { label: "Sports", value: String(sports.length), color: [147, 51, 234] },
  ];

  const cardW = 55;
  const cardGap = 8;
  const cardStartX = 14;

  statsData.forEach((stat, i) => {
    const x = cardStartX + i * (cardW + cardGap);
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, statsY, cardW, 18, 3, 3, "F");
    // Colored left accent
    doc.setFillColor(...stat.color);
    doc.roundedRect(x, statsY, 3, 18, 1.5, 1.5, "F");
    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...stat.color);
    doc.text(stat.value, x + 10, statsY + 8);
    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(stat.label, x + 10, statsY + 14);
  });

  // ── Table ──
  const tableRows = teams.map((t, index) => {
    const captain =
      typeof t.captain === "object" && t.captain?.fullName
        ? t.captain.fullName
        : "—";
    const memberCount = Array.isArray(t.members) ? t.members.length : 0;
    const status = t.isActive === false ? "Inactive" : "Active";
    const society = t.society || "—";
    const email = t.contactEmail || "—";
    const phone = t.contactPhone || "—";

    return [
      String(index + 1),
      t.teamName || "—",
      society,
      t.sportType || "—",
      captain,
      String(memberCount),
      email,
      phone,
      status,
    ];
  });

  autoTable(doc, {
    startY: 64,
    head: [
      [
        "#",
        "Team Name",
        "Society",
        "Sport",
        "Captain",
        "Members",
        "Contact Email",
        "Contact Phone",
        "Status",
      ],
    ],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center" },
      1: { fontStyle: "bold" },
      5: { halign: "center" },
      8: { halign: "center" },
    },
    didParseCell: function (data) {
      // Color the Status column
      if (data.section === "body" && data.column.index === 8) {
        const val = String(data.cell.raw).toLowerCase();
        if (val === "active") {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [107, 114, 128];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer on each page ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    const pageW = doc.internal.pageSize.getWidth();

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 12, pageW - 14, pageH - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("SLIIT SportSync — Team Management System", 14, pageH - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 7, {
      align: "right",
    });
  }

  // ── Download ──
  const fileName = `SLIIT_Teams_Report_${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.pdf`;
  doc.save(fileName);
}

/**
 * Generates and downloads a PDF for a single team's details.
 * @param {Object} team - Single team object from the API
 */
export function downloadSingleTeamPdf(team) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Header ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 36, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("SLIIT SportSync", 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Team Detail Report", 14, 25);

  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr}`, doc.internal.pageSize.getWidth() - 14, 16, {
    align: "right",
  });

  // ── Team Name ──
  let y = 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(team.teamName || "Unnamed Team", 14, y);

  // Status badge
  const status = team.isActive === false ? "INACTIVE" : "ACTIVE";
  const statusColor = team.isActive === false ? [107, 114, 128] : [5, 150, 105];
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...statusColor);
  const statusX = doc.getTextWidth(team.teamName || "Unnamed Team") + 20;
  doc.text(status, Math.min(statusX, 140), y);

  // ── Team Info Cards ──
  y += 12;
  const infoItems = [
    { label: "Sport Type", value: team.sportType || "—" },
    { label: "Society", value: team.society || "—" },
    {
      label: "Captain",
      value:
        typeof team.captain === "object" && team.captain?.fullName
          ? team.captain.fullName
          : "—",
    },
    {
      label: "Total Members",
      value: String(Array.isArray(team.members) ? team.members.length : 0),
    },
    { label: "Contact Email", value: team.contactEmail || "—" },
    { label: "Contact Phone", value: team.contactPhone || "—" },
    {
      label: "Created",
      value: team.createdAt
        ? new Date(team.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    },
    {
      label: "Last Updated",
      value: team.updatedAt
        ? new Date(team.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    },
  ];

  const colW = 88;
  infoItems.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 14 + col * colW;
    const itemY = y + row * 16;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, itemY - 4, colW - 6, 13, 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x + 4, itemY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.value), x + 4, itemY + 6);
  });

  // ── Members Table ──
  y += Math.ceil(infoItems.length / 2) * 16 + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Team Roster", 14, y);
  y += 4;

  const members = Array.isArray(team.members) ? team.members : [];
  if (members.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("No members assigned to this team yet.", 14, y + 6);
  } else {
    const captainId =
      typeof team.captain === "object" ? String(team.captain?._id || "") : String(team.captain || "");

    const memberRows = members.map((m, index) => {
      const name = typeof m === "object" ? m.fullName || "—" : String(m);
      const sid = typeof m === "object" ? m.studentId || "—" : "—";
      const email = typeof m === "object" ? m.email || "—" : "—";
      const mid = typeof m === "object" ? String(m._id || "") : String(m);
      const isCaptain = mid === captainId ? "★ Captain" : "Member";

      return [String(index + 1), name, sid, email, isCaptain];
    });

    autoTable(doc, {
      startY: y,
      head: [["#", "Full Name", "Student ID", "Email", "Role"]],
      body: memberRows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center" },
        1: { fontStyle: "bold" },
        4: { halign: "center" },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 4) {
          const val = String(data.cell.raw);
          if (val.includes("Captain")) {
            data.cell.styles.textColor = [202, 138, 4];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 12, pageW - 14, pageH - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("SLIIT SportSync — Team Management System", 14, pageH - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 7, {
      align: "right",
    });
  }

  // ── Download ──
  const safeName = String(team.teamName || "team")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  doc.save(`${safeName}_Report.pdf`);
}
