"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  CheckCircle2,
  Cpu,
  Activity,
  Sparkles,
  Trash2,
  Check,
  Inbox,
  Filter,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import HelpTooltip from "@/components/common/HelpTooltip";

import { NotificationService, type NotificationItem } from "@/services/notification.service";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "system" | "disease">("all");

  useEffect(() => {
    // 1. Instant 0ms cached load
    const cached = NotificationService.getCachedNotifications();
    if (cached && cached.length > 0) {
      setNotifications(cached);
    }
    // 2. Parallel background sync
    NotificationService.getNotifications().then((records) => {
      setNotifications(records || []);
    });
  }, []);

  const markAsRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    await NotificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    await NotificationService.markAllAsRead();
  };

  const deleteNotification = async (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    await NotificationService.deleteNotification(id);
  };

  const clearAll = async () => {
    setNotifications([]);
    await NotificationService.clearAll();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "system") return n.category === "system";
    if (filter === "disease") return n.category === "disease" || n.category === "benchmark";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5 pb-12 w-full"
    >
      {/* HEADER SECTION (Matching MedTech Workstation Design) */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-gradient-to-br from-white via-[#FAFDFD] to-[#EBF7F5]/50 p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00B489]/10 via-[#006766]/5 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F4] border border-[#00B489]/30 text-xs font-semibold text-[#006766]">
              <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
              <span>Updates &amp; Alerts</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
              Notification Center
            </h1>
            <p className="text-xs sm:text-sm text-[#5A7470] font-normal leading-relaxed">
              Stay informed on system status, clinical model updates, and diagnostic screening reports.
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-4 py-2 rounded-2xl border border-[#DFEBE8] bg-white hover:bg-[#F2F7F6] text-[#082827] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Check size={13} className="text-[#006766]" /> Mark All as Read
                </button>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 rounded-2xl border border-[#DFEBE8] bg-white hover:bg-rose-50 hover:border-rose-200 text-[#5A7470] hover:text-rose-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Trash2 size={13} /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#E6F7F4]/60 rounded-xl border border-[#DFEBE8] text-xs font-sans w-fit">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer font-medium ${
            filter === "all"
              ? "bg-[#006766] text-white shadow-xs font-semibold"
              : "text-[#5A7470] hover:text-[#082827]"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer font-medium ${
            filter === "unread"
              ? "bg-[#006766] text-white shadow-xs font-semibold"
              : "text-[#5A7470] hover:text-[#082827]"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("system")}
          className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer font-medium ${
            filter === "system"
              ? "bg-[#006766] text-white shadow-xs font-semibold"
              : "text-[#5A7470] hover:text-[#082827]"
          }`}
        >
          System Alerts
        </button>
        <button
          type="button"
          onClick={() => setFilter("disease")}
          className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer font-medium ${
            filter === "disease"
              ? "bg-[#006766] text-white shadow-xs font-semibold"
              : "text-[#5A7470] hover:text-[#082827]"
          }`}
        >
          Medical Models
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#DFEBE8] shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F7F4] border border-[#DFEBE8] text-[#006766] mx-auto flex items-center justify-center shadow-xs">
            <Inbox size={22} />
          </div>
          <h3 className="font-sans text-lg font-bold text-[#082827]">
            No notifications in this category
          </h3>
          <p className="text-xs text-[#5A7470] font-normal max-w-sm mx-auto">
            You're all caught up! New system calibrations and screening reports will be announced here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  notif.read
                    ? "bg-white/80 border-[#DFEBE8] shadow-xs"
                    : "bg-white border-[#00B489]/50 shadow-[0_4px_20px_-4px_rgba(0,180,137,0.15)] ring-1 ring-[#00B489]/20"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      notif.category === "system"
                        ? "bg-[#E6F7F4] text-[#006766] border-[#00B489]/20"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                    }`}
                  >
                    {notif.category === "system" ? <Cpu size={18} /> : <Sparkles size={18} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans text-sm sm:text-base font-bold text-[#082827]">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#00B489] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#5A7470] font-normal leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#5A7470]/70 font-mono block pt-0.5">
                      {notif.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {notif.actionUrl && (
                    <Link
                      href={notif.actionUrl}
                      className="text-xs font-semibold text-[#006766] hover:text-[#0D4F46] flex items-center gap-1 transition-colors"
                    >
                      {notif.actionLabel || "View"} <ArrowRight size={12} />
                    </Link>
                  )}
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-[#E6F7F4] border border-[#DFEBE8] text-[#5A7470] hover:text-[#006766] transition-colors cursor-pointer text-xs"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 border border-[#DFEBE8] text-[#5A7470] hover:text-rose-700 transition-colors cursor-pointer text-xs"
                    title="Delete notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
