import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ローカルストレージをクリアする関数
export const clearVotingStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('voting-storage');
    console.log('Voting storage cleared');
  }
};

// ローカルストレージの状態を確認する関数
export const checkVotingStorage = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('voting-storage');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('Current voting storage:', parsed);
        return parsed;
      } catch (error) {
        console.error('Failed to parse voting storage:', error);
        return null;
      }
    }
    console.log('No voting storage found');
    return null;
  }
  return null;
};
