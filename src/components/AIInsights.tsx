import React from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Department, Patient } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface AIInsightsProps {
  departments: Department[];
  patients: Patient[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ departments, patients }) => {
  const [insight, setInsight] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const prompt = `
        As a Hospital Operations AI, analyze the following hospital state and provide 3-4 concise, actionable recommendations to manage the crowd and optimize patient flow.
        
        Priority Rules:
        - Triage Level 1 is most urgent.
        - Pregnancy patients have higher priority than elderly patients within the same triage level.
        - Children also have high priority.
        
        Departments: ${JSON.stringify(departments)}
        Waiting Patients: ${JSON.stringify(patients)}
        
        Focus on:
        1. Resource reallocation (e.g., moving staff).
        2. Wait time reduction based on priority.
        3. Critical alerts for high-priority patients waiting too long.
        
        Return the response in a clear, professional bulleted list.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || "No insights available at the moment.");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setInsight("Failed to generate AI insights. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    generateInsight();
  }, []);

  return (
    <div className="bg-hospital-surface border border-hospital-line rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-hospital-accent" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">AI Operational Insights</h3>
        </div>
        <button 
          onClick={generateInsight}
          disabled={loading}
          className="text-[10px] font-bold uppercase tracking-widest text-hospital-accent hover:underline disabled:opacity-50"
        >
          Refresh Analysis
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-xs font-mono">Analyzing hospital flow patterns...</p>
        </div>
      ) : insight ? (
        <div className="prose prose-sm max-w-none text-slate-400 font-sans leading-relaxed prose-invert">
          <div className="whitespace-pre-wrap">{insight}</div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-hospital-accent py-4">
          <AlertCircle className="w-4 h-4" />
          <p className="text-xs">Unable to load insights.</p>
        </div>
      )}
    </div>
  );
};
