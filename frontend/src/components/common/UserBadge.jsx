import React from 'react';
import { Link } from 'react-router-dom';

const UserBadge = ({
  user,
  size = 'medium',
  showRole = true,
  showReputation = true,
  showJoinDate = false,
  linkToProfile = true,
  className = ''
}) => {
  if (!user) return null;

  const sizeClasses = {
    small: {
      avatar: 'w-6 h-6',
      text: 'text-xs',
      container: 'space-x-2'
    },
    medium: {
      avatar: 'w-8 h-8',
      text: 'text-sm',
      container: 'space-x-3'
    },
    large: {
      avatar: 'w-10 h-10',
      text: 'text-base',
      container: 'space-x-4'
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      case 'instructor':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'moderator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  const formatReputation = (rep) => {
    if (rep >= 1000000) return `${(rep / 1000000).toFixed(1)}M`;
    if (rep >= 1000) return `${(rep / 1000).toFixed(1)}K`;
    return rep?.toString() || '0';
  };

  const formatJoinDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const joinDate = new Date(date);
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const badgeContent = (
    <div className={`flex items-center ${sizeClasses[size].container} ${className}`}>
      {/* Avatar */}
      <div className={`${sizeClasses[size].avatar} rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${sizeClasses[size].text}`}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || user.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          (user.name || user.username || 'U').charAt(0).toUpperCase()
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className={`font-medium text-foreground ${sizeClasses[size].text}`}>
            {user.name || user.username}
          </span>
          {showRole && user.role && user.role !== 'user' && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
          )}
        </div>

        {/* Reputation and Join Date */}
        {(showReputation || showJoinDate) && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            {showReputation && (
              <span className={`${sizeClasses[size].text}`}>
                {formatReputation(user.reputation || 0)} rep
              </span>
            )}
            {showJoinDate && user.createdAt && (
              <span className={`${sizeClasses[size].text}`}>
                joined {formatJoinDate(user.createdAt)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (linkToProfile) {
    return (
      <Link
        to={`/user/${user._id || user.id}`}
        className="hover:opacity-80 transition-opacity"
      >
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
};

export default UserBadge;