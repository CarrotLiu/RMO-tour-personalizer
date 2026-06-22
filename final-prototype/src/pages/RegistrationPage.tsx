import { FormEvent, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function RegistrationPage({ onRegister }: { onRegister: (name: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      inputRef.current?.focus();
      return;
    }
    onRegister(trimmedName);
  }

  return (
    <form className="registration-page" onSubmit={handleSubmit}>
      <motion.div
        className="registration-copy"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
      >
        <h1>My Field Journal</h1>
        <p>This journal is written by</p>
        <span className="registration-name-row">
          <label className={`registration-name-gap ${name.trim() ? 'has-value' : ''}`}>
            <span className="sr-only">Enter username</span>
            <input
              ref={inputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter Username"
              autoComplete="name"
              enterKeyHint="done"
              maxLength={18}
            />
          </label>
          {name.trim() && (
            <motion.button
              className="registration-check"
              type="submit"
              aria-label="Confirm username"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check size={18} strokeWidth={2.4} />
            </motion.button>
          )}
        </span>
        <p className="registration-line">a brave traveler,</p>
        <p className="registration-line">to document the traces of the past</p>
      </motion.div>

      <motion.button
        className="registration-start"
        type="submit"
        aria-label="Start field journal"
        disabled={!name.trim()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.22, duration: 0.3 }}
      >
        <span className="registration-start-ring" />
      </motion.button>
    </form>
  );
}
