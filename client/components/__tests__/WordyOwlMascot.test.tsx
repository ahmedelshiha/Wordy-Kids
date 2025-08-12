import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WordyOwlMascot from '../WordyOwlMascot';

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('WordyOwlMascot', () => {
  it('renders the initial message', () => {
    render(<WordyOwlMascot />);
    
    expect(screen.getByText(/Hi there! I'm Wordy/)).toBeInTheDocument();
  });

  it('changes message after 5 seconds', async () => {
    render(<WordyOwlMascot />);
    
    // Fast-forward time by 5 seconds
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.getByText(/Let's learn 5 new words today/)).toBeInTheDocument();
    });
  });

  it('shows sparkle effects when clicked', () => {
    render(<WordyOwlMascot />);
    
    const owlSvg = screen.getByRole('img', { hidden: true });
    fireEvent.click(owlSvg.parentElement!);
    
    expect(screen.getByText('✨')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('💫')).toBeInTheDocument();
  });

  it('shows encouraging message when clicked', () => {
    render(<WordyOwlMascot />);
    
    const owlContainer = screen.getByRole('img', { hidden: true }).parentElement!;
    fireEvent.click(owlContainer);
    
    // Should show one of the encouraging messages
    const encouragingMessages = [
      'Hoot hoot! Click me anytime for encouragement!',
      'You\'re doing amazing! Keep up the great work!',
      'Every word you learn makes you smarter!'
    ];
    
    const hasEncouragingMessage = encouragingMessages.some(message => 
      screen.queryByText(new RegExp(message))
    );
    
    expect(hasEncouragingMessage).toBeTruthy();
  });

  it('has bounce animation class', () => {
    render(<WordyOwlMascot />);
    
    const owlContainer = screen.getByRole('img', { hidden: true }).parentElement!;
    expect(owlContainer).toHaveClass('animate-gentle-bounce');
  });
});
