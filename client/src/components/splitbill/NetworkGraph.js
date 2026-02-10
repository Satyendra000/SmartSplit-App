import { useMemo, useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

/* Stable references */
const nodeTypes = {};
const edgeTypes = {};

const DebtNetworkFlow = ({ expenses = [], participants = [] }) => {
  const [isZoomLocked, setIsZoomLocked] = useState(true);

  const { nodes, edges } = useMemo(() => {
    if (!participants || participants.length === 0) {
      return { nodes: [], edges: [] };
    }

    /* ---------------- BALANCE CALCULATION ---------------- */
    const balances = {};
    participants.forEach((p) => {
      balances[p] = 0;
    });

    expenses.forEach((expense) => {
      if (expense.splits && expense.splits.length > 0) {
        if (expense.expenseType === "shared") {
          const payer = expense.paidByName;
          const totalAmount = expense.amount;
          const splitCount = expense.splits.length;
          const perPersonAmount = totalAmount / splitCount;

          expense.splits.forEach((split) => {
            const person = split.userName;
            if (person !== payer) {
              balances[payer] += perPersonAmount;
              balances[person] -= perPersonAmount;
            }
          });
        } else if (
          expense.expenseType === "settlement" ||
          expense.isSettlement
        ) {
          expense.splits.forEach((split) => {
            if (balances[split.userName] !== undefined) {
              balances[split.userName] += split.amount;
            }
          });
        }
      }
    });

    /* ---------------- SIMPLIFY DEBTS ---------------- */
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([person, balance]) => {
      if (balance > 0.01) creditors.push({ person, amount: balance });
      else if (balance < -0.01) debtors.push({ person, amount: -balance });
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const simplifiedDebts = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const settleAmount = Math.min(debtor.amount, creditor.amount);

      if (settleAmount > 0.01) {
        simplifiedDebts.push({
          from: debtor.person,
          to: creditor.person,
          amount: settleAmount,
        });
      }

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    /* ---------------- RESPONSIVE LAYOUT ---------------- */
    const width = typeof window !== "undefined" ? window.innerWidth : 800;

    const isMobile = width < 640;

    const centerX = isMobile ? 150 : 250;
    const centerY = isMobile ? 150 : 250;
    const radius = isMobile ? 110 : 180;

    /* ---------------- NODES WITH BALANCE COLOR ---------------- */
    const generatedNodes = participants.map((person, index) => {
      const angle = (2 * Math.PI * index) / participants.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const isFirstPerson = index === 0;
      const balance = balances[person] || 0;

      let balanceColor = "#ffffff";
      let glow = "none";

      if (balance > 0.01) {
        balanceColor = "#22c55e"; // green
        glow = "0 0 12px rgba(34,197,94,0.5)";
      } else if (balance < -0.01) {
        balanceColor = "#ef4444"; // red
        glow = "0 0 12px rgba(239,68,68,0.5)";
      }

      return {
        id: person,
        data: {
          label: (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                {isFirstPerson ? `${person} (You)` : person}
              </span>
              {Math.abs(balance) > 0.01 && (
                <span
                  style={{
                    color: balanceColor,
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                >
                  {balance > 0 ? "+" : "-"}₹{Math.abs(balance).toFixed(2)}
                </span>
              )}
            </div>
          ),
        },
        position: { x, y },
        style: {
          background: isFirstPerson
            ? "linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
            : "rgba(255, 255, 255, 0.05)",
          color: "#ffffff",
          border:
            Math.abs(balance) > 0.01
              ? `2px solid ${balanceColor}`
              : "2px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "14px",
          padding: isMobile ? "10px 14px" : "16px 24px",
          fontWeight: "600",
          fontSize: isMobile ? "12px" : "14px",
          boxShadow: isFirstPerson
            ? "0 8px 24px rgba(249, 115, 22, 0.25)"
            : glow || "0 4px 12px rgba(0,0,0,0.3)",
          minWidth: isMobile ? "90px" : "110px",
          textAlign: "center",
        },
      };
    });

    /* ---------------- EDGES (NO AMOUNT LABEL) ---------------- */
    const generatedEdges = simplifiedDebts.map((debt, index) => ({
      id: `e-${index}-${debt.from}-${debt.to}`,
      source: debt.from,
      target: debt.to,
      animated: true,
      type: "default",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#fb923c",
        width: 20,
        height: 20,
      },
      style: {
        strokeWidth: 2,
        stroke: "#fb923c",
      },
    }));

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [expenses, participants]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  if (!participants || participants.length === 0) {
    return (
      <div
        style={{ width: "100%", height: "450px" }}
        className="flex items-center justify-center bg-[#0a0a0a] rounded-2xl border border-white/10"
      >
        <p className="text-white/50">Add participants to see the network</p>
      </div>
    );
  }

  return (
    <div 
      style={{ width: "100%", height: "450px", position: "relative" }}
      onDoubleClick={() => setIsZoomLocked(!isZoomLocked)}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        zoomOnScroll={!isZoomLocked}
        zoomOnPinch={!isZoomLocked}
        zoomOnDoubleClick={false}
        panOnScroll={!isZoomLocked}
        panOnDrag={!isZoomLocked}
        preventScrolling={isZoomLocked}
        style={{
          background: "#0a0a0a",
          borderRadius: "1rem",
        }}
      >
        <Controls showInteractive={false}>
          <button
            onClick={() => setIsZoomLocked(!isZoomLocked)}
            title={isZoomLocked ? "Unlock zoom (Double-click)" : "Lock zoom (Double-click)"}
            style={{
              width: "100%",
              height: "32px",
              border: "none",
              background: "rgba(255, 255, 255, 0.9)",
              color: isZoomLocked ? "#ef4444" : "#22c55e",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "all 0.2s ease",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
            }}
          >
            {isZoomLocked ? "🔒" : "🔓"}
          </button>
        </Controls>
        <Background
          variant="dots"
          gap={20}
          size={1}
          color="rgba(255, 255, 255, 0.05)"
        />
      </ReactFlow>
    </div>
  );
};

export default DebtNetworkFlow;