export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'it' | 'ru' | 'ar';

export const translations: Record<Language, any> = {
  en: {
    dashboard: "Dashboard",
    history: "History & Analytics",
    language: "Language",
    stats: {
      total: "Total Publishes",
      pending: "Pending",
      successRate: "Success Rate"
    },
    quickActions: {
      label: "Quick Actions",
      revert: "Revert Last Publish",
      refresh: "Refresh Themes",
      shopify: "Shopify Library",
      noHistory: "No Revert Available"
    },
    activity: {
      title: "Upcoming & Recent Activity",
      noActivity: "No activity records found.",
      by: "by",
      reverted: "Reverted",
      revert: "Revert",
      clear: "Clear",
      error: "Error"
    },
    themes: {
      title: "Available Themes",
      publishNow: "Publish Now",
      schedule: "Schedule",
      live: "LIVE"
    },
    modal: {
      title: "Schedule Theme Publish",
      theme: "Selected Theme",
      publisher: "Publisher Name",
      notes: "Internal Notes",
      notesPlaceholder: "Why are you publishing this?",
      time: "Scheduled Time",
      schedule: "Confirm Schedule",
      cancel: "Cancel"
    },
    historyPage: {
      detailedLog: "Detailed Activity Log",
      theme: "Theme",
      publisher: "Publisher",
      updateNotes: "Update Notes",
      publishedAt: "Published At",
      status: "Status",
      actions: "Actions",
      preview: "Preview",
      delete: "Delete",
      successRate: "Overall Success Rate",
      totalPublishes: "Total Records",
      failedAttempts: "Failed Attempts",
      noHistory: "No history records yet."
    }
  },
  hi: {
    dashboard: "डैशबोर्ड",
    history: "इतिहास और एनालिटिक्स",
    language: "भाषा",
    stats: {
      total: "कुल प्रकाशन",
      pending: "लंबित",
      successRate: "सफलता दर"
    },
    quickActions: {
      label: "त्वरित कार्रवाई",
      revert: "पिछला रिवर्ट करें",
      refresh: "थीम रिफ्रेश",
      shopify: "शॉपीफाई लाइब्रेरी",
      noHistory: "कोई रिवर्ट नहीं"
    },
    activity: {
      title: "आगामी और हाल की गतिविधि",
      noActivity: "कोई गतिविधि नहीं मिली।",
      by: "द्वारा",
      reverted: "रिवर्ट किया गया",
      revert: "रिवर्ट",
      clear: "साफ़ करें",
      error: "त्रुटि"
    },
    themes: {
      title: "उपलब्ध थीम",
      publishNow: "अभी प्रकाशित करें",
      schedule: "शेड्यूल करें",
      live: "लाइव"
    },
    modal: {
      title: "थीम प्रकाशन शेड्यूल करें",
      theme: "चुनी गई थीम",
      publisher: "प्रकाशक का नाम",
      notes: "आंतरिक नोट्स",
      notesPlaceholder: "आप इसे क्यों प्रकाशित कर रहे हैं?",
      time: "निर्धारित समय",
      schedule: "शेड्यूल की पुष्टि करें",
      cancel: "रद्द करें"
    },
    historyPage: {
      detailedLog: "विस्तृत गतिविधि लॉग",
      theme: "थीम",
      publisher: "प्रकाशक",
      updateNotes: "अपडेट नोट्स",
      publishedAt: "प्रकाशित होने का समय",
      status: "स्थिति",
      actions: "कार्रवाई",
      preview: "पूर्वावलोकन",
      delete: "हटाएं",
      successRate: "कुल सफलता दर",
      totalPublishes: "कुल रिकॉर्ड",
      failedAttempts: "विफल प्रयास",
      noHistory: "अभी तक कोई इतिहास नहीं है।"
    }
  },
  es: {
    dashboard: "Panel de Control",
    history: "Historial y Analítica",
    language: "Idioma",
    stats: {
      total: "Publicaciones Totales",
      pending: "Pendiente",
      successRate: "Tasa de Éxito"
    },
    quickActions: {
      label: "Acciones Rápidas",
      revert: "Revertir Última",
      refresh: "Refrescar Temas",
      shopify: "Biblioteca Shopify",
      noHistory: "No Disponible"
    },
    activity: {
      title: "Actividad Reciente",
      noActivity: "No hay actividad.",
      by: "por",
      reverted: "Revertido",
      revert: "Revertir",
      clear: "Limpiar",
      error: "Error"
    },
    themes: {
      title: "Temas Disponibles",
      publishNow: "Publicar Ahora",
      schedule: "Programar",
      live: "EN VIVO"
    },
    modal: {
      title: "Programar Publicación",
      theme: "Tema Seleccionado",
      publisher: "Publicador",
      notes: "Notas Internas",
      notesPlaceholder: "¿Por qué publicas esto?",
      time: "Hora Programada",
      schedule: "Confirmar",
      cancel: "Cancelar"
    },
    historyPage: {
      detailedLog: "Registro Detallado",
      theme: "Tema",
      publisher: "Publicador",
      updateNotes: "Notas",
      publishedAt: "Publicado en",
      status: "Estado",
      actions: "Acciones",
      preview: "Previsualizar",
      delete: "Eliminar",
      successRate: "Éxito General",
      totalPublishes: "Total de Registros",
      failedAttempts: "Intentos Fallidos",
      noHistory: "Sin registros."
    }
  },
  fr: {
    dashboard: "Tableau de Bord",
    history: "Historique & Analyses",
    language: "Langue",
    stats: {
      total: "Publications Totales",
      pending: "En Attente",
      successRate: "Taux de Réussite"
    },
    quickActions: {
      label: "Actions Rapides",
      revert: "Annuler Publication",
      refresh: "Actualiser Thèmes",
      shopify: "Bibliothèque Shopify",
      noHistory: "Indisponible"
    },
    activity: {
      title: "Activité Récente",
      noActivity: "Aucune activité.",
      by: "par",
      reverted: "Annulé",
      revert: "Annuler",
      clear: "Effacer",
      error: "Erreur"
    },
    themes: {
      title: "Thèmes Disponibles",
      publishNow: "Publier",
      schedule: "Planifier",
      live: "EN DIRECT"
    },
    modal: {
      title: "Planifier Publication",
      theme: "Thème Sélectionné",
      publisher: "Auteur",
      notes: "Notes Internes",
      notesPlaceholder: "Pourquoi publiez-vous ?",
      time: "Heure Prévue",
      schedule: "Confirmer",
      cancel: "Annuler"
    },
    historyPage: {
      detailedLog: "Journal Détaillé",
      theme: "Thème",
      publisher: "Auteur",
      updateNotes: "Notes",
      publishedAt: "Publié le",
      status: "Statut",
      actions: "Actions",
      preview: "Aperçu",
      delete: "Supprimer",
      successRate: "Taux Global",
      totalPublishes: "Total",
      failedAttempts: "Échecs",
      noHistory: "Aucun historique."
    }
  },
  de: {
    dashboard: "Dashboard",
    history: "Verlauf & Analysen",
    language: "Sprache",
    stats: {
      total: "Veröffentlichungen",
      pending: "Ausstehend",
      successRate: "Erfolgsquote"
    },
    quickActions: {
      label: "Schnellaktionen",
      revert: "Letzte Rückgängig",
      refresh: "Themen Laden",
      shopify: "Shopify Mediathek",
      noHistory: "Nicht Verfügbar"
    },
    activity: {
      title: "Letzte Aktivitäten",
      noActivity: "Keine Aktivitäten.",
      by: "von",
      reverted: "Widerrufen",
      revert: "Widerrufen",
      clear: "Leeren",
      error: "Fehler"
    },
    themes: {
      title: "Verfügbare Themen",
      publishNow: "Veröffentlichen",
      schedule: "Planen",
      live: "LIVE"
    },
    modal: {
      title: "Planung Bestätigen",
      theme: "Thema",
      publisher: "Autor",
      notes: "Notizen",
      notesPlaceholder: "Grund der Änderung",
      time: "Zeitpunkt",
      schedule: "Bestätigen",
      cancel: "Abbrechen"
    },
    historyPage: {
      detailedLog: "Detailliertes Protokoll",
      theme: "Thema",
      publisher: "Autor",
      updateNotes: "Notizen",
      publishedAt: "Veröffentlicht am",
      status: "Status",
      actions: "Aktionen",
      preview: "Vorschau",
      delete: "Löschen",
      successRate: "Erfolgsquote",
      totalPublishes: "Datensätze",
      failedAttempts: "Fehlgeschlagen",
      noHistory: "Kein Verlauf."
    }
  },
  zh: {
    dashboard: "仪表板",
    history: "历史与分析",
    language: "语言",
    stats: {
      total: "总发布数",
      pending: "待处理",
      successRate: "成功率"
    },
    quickActions: {
      label: "快速操作",
      revert: "撤销上次发布",
      refresh: "刷新主题",
      shopify: "Shopify 库",
      noHistory: "不可撤销"
    },
    activity: {
      title: "近期活动",
      noActivity: "未发现活动记录。",
      by: "由",
      reverted: "已撤销",
      revert: "撤销",
      clear: "清除",
      error: "错误"
    },
    themes: {
      title: "可用主题",
      publishNow: "立即发布",
      schedule: "计划任务",
      live: "在线"
    },
    modal: {
      title: "计划主题发布",
      theme: "选定主题",
      publisher: "发布者",
      notes: "备注",
      notesPlaceholder: "为什么要发布此内容？",
      time: "计划时间",
      schedule: "确认计划",
      cancel: "取消"
    },
    historyPage: {
      detailedLog: "详细日志",
      theme: "主题",
      publisher: "发布者",
      updateNotes: "更新备注",
      publishedAt: "发布于",
      status: "状态",
      actions: "操作",
      preview: "预览",
      delete: "删除",
      successRate: "总体成功率",
      totalPublishes: "记录总数",
      failedAttempts: "失败尝试",
      noHistory: "暂无记录。"
    }
  },
  ja: {
    dashboard: "ダッシュボード",
    history: "履歴と分析",
    language: "言語",
    stats: {
      total: "総公開数",
      pending: "保留中",
      successRate: "成功率"
    },
    quickActions: {
      label: "クイックアクション",
      revert: "元に戻す",
      refresh: "更新",
      shopify: "Shopify ライブラリ",
      noHistory: "履歴なし"
    },
    activity: {
      title: "最近のアクティビティ",
      noActivity: "アクティビティはありません。",
      by: "by",
      reverted: "復元済み",
      revert: "復元",
      clear: "クリア",
      error: "エラー"
    },
    themes: {
      title: "利用可能なテーマ",
      publishNow: "今すぐ公開",
      schedule: "スケジュール",
      live: "ライブ"
    },
    modal: {
      title: "公開スケジュール",
      theme: "選択されたテーマ",
      publisher: "公開者",
      notes: "内部メモ",
      notesPlaceholder: "変更理由",
      time: "予定時刻",
      schedule: "予約確定",
      cancel: "キャンセル"
    },
    historyPage: {
      detailedLog: "詳細ログ",
      theme: "テーマ",
      publisher: "公開者",
      updateNotes: "メモ",
      publishedAt: "公開日時",
      status: "ステータス",
      actions: "操作",
      preview: "プレビュー",
      delete: "削除",
      successRate: "全体成功率",
      totalPublishes: "総数",
      failedAttempts: "失敗",
      noHistory: "履歴がありません。"
    }
  },
  pt: {
    dashboard: "Painel",
    history: "Histórico e Análise",
    language: "Idioma",
    stats: {
      total: "Total de Publicações",
      pending: "Pendente",
      successRate: "Taxa de Sucesso"
    },
    quickActions: {
      label: "Ações Rápidas",
      revert: "Reverter Última",
      refresh: "Atualizar Temas",
      shopify: "Biblioteca Shopify",
      noHistory: "Indisponível"
    },
    activity: {
      title: "Atividade Recente",
      noActivity: "Nenhuma atividade encontrada.",
      by: "por",
      reverted: "Revertido",
      revert: "Reverter",
      clear: "Limpar",
      error: "Erro"
    },
    themes: {
      title: "Temas Disponíveis",
      publishNow: "Publicar Agora",
      schedule: "Agendar",
      live: "AO VIVO"
    },
    modal: {
      title: "Agendar Publicação",
      theme: "Tema Selecionado",
      publisher: "Publicador",
      notes: "Notas Internas",
      notesPlaceholder: "Por que publicar agora?",
      time: "Horário Agendado",
      schedule: "Confirmar",
      cancel: "Cancelar"
    },
    historyPage: {
      detailedLog: "Log Detalhado",
      theme: "Tema",
      publisher: "Publicador",
      updateNotes: "Notas",
      publishedAt: "Publicado em",
      status: "Status",
      actions: "Ações",
      preview: "Visualizar",
      delete: "Excluir",
      successRate: "Sucesso Geral",
      totalPublishes: "Registros",
      failedAttempts: "Falhas",
      noHistory: "Sem histórico."
    }
  },
  it: {
    dashboard: "Dashboard",
    history: "Cronologia e Analisi",
    language: "Lingua",
    stats: {
      total: "Pubblicazioni Totali",
      pending: "In sospeso",
      successRate: "Tasso di successo"
    },
    quickActions: {
      label: "Azioni Rapide",
      revert: "Annulla Ultima",
      refresh: "Aggiorna Temi",
      shopify: "Libreria Shopify",
      noHistory: "Non disponibile"
    },
    activity: {
      title: "Attività Recente",
      noActivity: "Nessuna attività.",
      by: "da",
      reverted: "Annullato",
      revert: "Annulla",
      clear: "Pulisci",
      error: "Errore"
    },
    themes: {
      title: "Temi Disponibili",
      publishNow: "Pubblica Ora",
      schedule: "Pianifica",
      live: "LIVE"
    },
    modal: {
      title: "Pianifica Pubblicazione",
      theme: "Tema Selezionato",
      publisher: "Autore",
      notes: "Note Interne",
      notesPlaceholder: "Motivo della pubblicazione",
      time: "Ora Pianificata",
      schedule: "Conferma",
      cancel: "Annulla"
    },
    historyPage: {
      detailedLog: "Registro Dettagliato",
      theme: "Tema",
      publisher: "Autore",
      updateNotes: "Note",
      publishedAt: "Pubblicato il",
      status: "Stato",
      actions: "Azioni",
      preview: "Anteprima",
      delete: "Elimina",
      successRate: "Successo Globale",
      totalPublishes: "Registri",
      failedAttempts: "Falliti",
      noHistory: "Nessuna cronologia."
    }
  },
  ru: {
    dashboard: "Панель",
    history: "История и аналитика",
    language: "Язык",
    stats: {
      total: "Всего публикаций",
      pending: "В ожидании",
      successRate: "Успешность"
    },
    quickActions: {
      label: "Действия",
      revert: "Отменить последнюю",
      refresh: "Обновить темы",
      shopify: "Библиотека Shopify",
      noHistory: "Нет истории"
    },
    activity: {
      title: "Последние действия",
      noActivity: "Действий не найдено.",
      by: "от",
      reverted: "Отменено",
      revert: "Отменить",
      clear: "Очистить",
      error: "Ошибка"
    },
    themes: {
      title: "Доступные темы",
      publishNow: "Опубликовать",
      schedule: "Запланировать",
      live: "LIVE"
    },
    modal: {
      title: "Запланировать",
      theme: "Тема",
      publisher: "Автор",
      notes: "Заметки",
      notesPlaceholder: "Причина изменения",
      time: "Время",
      schedule: "Подтвердить",
      cancel: "Отмена"
    },
    historyPage: {
      detailedLog: "Подробный лог",
      theme: "Тема",
      publisher: "Автор",
      updateNotes: "Заметки",
      publishedAt: "Опубликовано",
      status: "Статус",
      actions: "Действия",
      preview: "Предпросмотр",
      delete: "Удалить",
      successRate: "Общий успех",
      totalPublishes: "Записей",
      failedAttempts: "Ошибки",
      noHistory: "Истории пока нет."
    }
  },
  ar: {
    dashboard: "لوحة التحكم",
    history: "السجل والتحليلات",
    language: "اللغة",
    stats: {
      total: "إجمالي النشر",
      pending: "قيد الانتظار",
      successRate: "نسبة النجاح"
    },
    quickActions: {
      label: "إجراءات سريعة",
      revert: "تراجع عن النشر",
      refresh: "تحديث القوالب",
      shopify: "مكتبة شوبيفاي",
      noHistory: "لا يوجد تراجع"
    },
    activity: {
      title: "النشاط الحالي والمستقبلي",
      noActivity: "لا يوجد سجل للنشاط.",
      by: "بواسطة",
      reverted: "تم التراجع",
      revert: "تراجع",
      clear: "مسح",
      error: "خطأ"
    },
    themes: {
      title: "القوالب المتاحة",
      publishNow: "انشر الآن",
      schedule: "جدولة",
      live: "مباشر"
    },
    modal: {
      title: "جدولة نشر القالب",
      theme: "القالب المختار",
      publisher: "اسم الناشر",
      notes: "ملاحظات داخلية",
      notesPlaceholder: "لماذا تنشر هذا؟",
      time: "الوقت المجدول",
      schedule: "تأكيد الجدولة",
      cancel: "إلغاء"
    },
    historyPage: {
      detailedLog: "سجل النشاط المفضل",
      theme: "القالب",
      publisher: "الناشر",
      updateNotes: "ملاحظات التحديث",
      publishedAt: "تم النشر في",
      status: "الحالة",
      actions: "الإجراءات",
      preview: "معاينة",
      delete: "حذف",
      successRate: "نسبة النجاح العامة",
      totalPublishes: "إجمالي السجلات",
      failedAttempts: "المحاولات الفاشلة",
      noHistory: "لا توجد سجلات بعد."
    }
  }
};

export function getTranslations(lang: Language) {
  return translations[lang] || translations['en'];
}
