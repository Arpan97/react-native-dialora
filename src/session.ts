import type { DialoraSelectionEvent } from './types';

/**
 * Options required to initialize a DialoraSession.
 */
export interface DialoraSessionOptions {
  /** Initial selected date, defaults to now */
  initialValue?: Date;
  /** Invoked when confirmed with the final Date */
  onConfirm?: (date: Date) => void;
  /** Invoked when cancelled; discards temporary selection */
  onCancel?: () => void;
  /** Invoked when dismissed without confirm/cancel */
  onDismiss?: () => void;
  /** Invoked on intermediate selection changes */
  onChange?: (event: DialoraSelectionEvent, date?: Date) => void;
}

/**
 * Encapsulates the lifecycle and callback contract of a single Dialora picker interaction.
 *
 * Guarantees:
 * 1. Confirm returns the committed Date.
 * 2. Cancel discards the candidate date.
 * 3. Dismiss never confirms a selection.
 * 4. Mutual exclusion: exactly zero or one terminal callback (confirm, cancel, dismiss) fires per session.
 */
export class DialoraSession {
  private candidateDate: Date;
  private hasEnded: boolean = false;
  private readonly options: DialoraSessionOptions;

  constructor(options: DialoraSessionOptions = {}) {
    this.options = options;
    const initial = options.initialValue;
    this.candidateDate =
      initial instanceof Date && !isNaN(initial.getTime())
        ? new Date(initial.getTime())
        : new Date();
  }

  /**
   * Retrieves a safe copy of the current candidate date.
   */
  public getCandidateDate(): Date {
    return new Date(this.candidateDate.getTime());
  }

  /**
   * Updates the intermediate candidate date and optionally triggers onChange.
   * Ignored if the session has already ended.
   */
  public setCandidateDate(date: Date, emitChange: boolean = true): boolean {
    if (this.hasEnded || !(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    this.candidateDate = new Date(date.getTime());
    if (emitChange) {
      const copy = this.getCandidateDate();
      this.options.onChange?.({ action: 'change', date: copy }, copy);
    }
    return true;
  }

  /**
   * Synchronizes the candidate date without emitting an onChange callback.
   * Used for external prop updates to prevent feedback loops.
   */
  public syncCandidateDate(date: Date): boolean {
    return this.setCandidateDate(date, false);
  }

  /**
   * Confirms the candidate date and invokes onConfirm.
   * Returns the confirmed Date or null if session was already completed.
   */
  public confirm(): Date | null {
    if (this.hasEnded) {
      return null;
    }
    this.hasEnded = true;
    const finalDate = this.getCandidateDate();
    this.options.onConfirm?.(finalDate);
    return finalDate;
  }

  /**
   * Cancels the session, discarding temporary changes and invoking onCancel.
   * Returns true if successfully cancelled, or false if already completed.
   */
  public cancel(): boolean {
    if (this.hasEnded) {
      return false;
    }
    this.hasEnded = true;
    this.options.onCancel?.();
    return true;
  }

  /**
   * Dismisses the session without confirmation, invoking onDismiss.
   * Returns true if successfully dismissed, or false if already completed.
   */
  public dismiss(): boolean {
    if (this.hasEnded) {
      return false;
    }
    this.hasEnded = true;
    this.options.onDismiss?.();
    return true;
  }

  /**
   * Returns true if a terminal action (confirm, cancel, dismiss) has concluded this session.
   */
  public isEnded(): boolean {
    return this.hasEnded;
  }
}
