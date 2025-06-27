import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

interface VoteButtonProps {
  type: 'upvote' | 'downvote'
  isActive: boolean
  count: number
  onClick: () => void
  disabled?: boolean
}

export function VoteButton({ type, isActive, count, onClick, disabled }: VoteButtonProps) {
  const isUpvote = type === 'upvote'
  const Icon = isUpvote ? ChevronUpIcon : ChevronDownIcon
  
  const activeColor = isUpvote ? 'text-orange-400' : 'text-blue-400'
  const activeBg = isUpvote ? 'bg-orange-400/20' : 'bg-blue-400/20'
  const hoverBg = isUpvote ? 'hover:bg-orange-400/10' : 'hover:bg-blue-400/10'
  
  return (
    <div className="flex flex-col items-center space-y-1">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative p-2 rounded-full transition-all duration-200 text-white/70',
          'hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
          hoverBg,
          isActive ? `${activeColor} ${activeBg}` : ''
        )}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        initial={false}
        animate={{
          rotate: isActive ? [0, 5, -5, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-6 h-6" />
        {isActive && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full border-2',
              isUpvote ? 'border-orange-400' : 'border-blue-400'
            )}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.button>
      
      <motion.span
        className={cn(
          'text-sm font-bold',
          isActive ? activeColor : 'text-white/70'
        )}
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {count}
      </motion.span>
    </div>
  )
}

interface VoteControlsProps {
  upvotes: number
  downvotes: number
  userVote?: 'upvote' | 'downvote' | null
  onVote: (type: 'upvote' | 'downvote') => void
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
}

export function VoteControls({ 
  upvotes, 
  downvotes, 
  userVote, 
  onVote, 
  disabled,
  orientation = 'vertical' 
}: VoteControlsProps) {
  const totalScore = upvotes - downvotes
  
  return (
    <motion.div
      className={cn(
        'flex items-center glass rounded-xl p-3',
        orientation === 'vertical' ? 'flex-col space-y-2' : 'space-x-4'
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <VoteButton
        type="upvote"
        isActive={userVote === 'upvote'}
        count={upvotes}
        onClick={() => onVote('upvote')}
        disabled={disabled}
      />
      
      {orientation === 'horizontal' && (
        <div className="text-center">
          <motion.div
            className={cn(
              'text-xl font-bold',
              totalScore > 0 ? 'text-green-400' : totalScore < 0 ? 'text-red-400' : 'text-white/70'
            )}
            animate={{ scale: userVote ? [1, 1.1, 1] : 1 }}
          >
            {totalScore >= 0 ? '+' : ''}{totalScore}
          </motion.div>
          <div className="text-xs text-white/50">score</div>
        </div>
      )}
      
      <VoteButton
        type="downvote"
        isActive={userVote === 'downvote'}
        count={downvotes}
        onClick={() => onVote('downvote')}
        disabled={disabled}
      />
    </motion.div>
  )
} 