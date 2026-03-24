import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { Image } from "expo-image";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX 
} from "lucide-react-native";
import moment from "moment";
import React, { useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface PostItemProps {
  post: any;
  currentUser: any;
  onLike: () => void;
  onComment: (text: string) => void;
  onDelete?: () => void;
  isViewable?: boolean;
}

export default function PostItem({
  post,
  currentUser,
  onLike,
  onComment,
  onDelete,
  isViewable = false,
}: PostItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showControls, setShowControls] = useState(false);

  const player = useVideoPlayer(post.mediaUrl, (player) => {
    player.loop = true;
    player.timeUpdateEventInterval = 0.05; // 50ms for smooth progress bar
  });
  const progress = useSharedValue(0);

  const playingEvent = useEvent(player, "playingChange");
  const isPlaying = playingEvent ? playingEvent.isPlaying : player.playing;
  const mutedEvent = useEvent(player, "mutedChange");
  const isMuted = mutedEvent ? mutedEvent.muted : player.muted;

  const timeUpdate = useEvent(player, "timeUpdate");

  // Sync progress value smoothly using the reactive event payload
  React.useEffect(() => {
    const duration = player.duration;
    if (duration > 0 && timeUpdate) {
      progress.value = timeUpdate.currentTime / duration;
    }
  }, [timeUpdate, player.duration]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  React.useEffect(() => {
    if (isViewable) {
      player.play();
    } else {
      player.pause();
      setShowControls(false); // Reset controls when scrolled away
    }
  }, [isViewable, player]);

  const isLiked =
    currentUser &&
    post.likes?.some(
      (id: string) => id === currentUser.id || id === currentUser._id,
    );

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onComment(commentText);
    setCommentText("");
  };

  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(handleLikeOnDoubleTap)();
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      runOnJS(setShowControls)(true);
    });

  const combinedGesture = Gesture.Exclusive(doubleTapGesture, singleTapGesture);
  const nativeGesture = Gesture.Native();
  const finalGesture = Gesture.Simultaneous(combinedGesture, nativeGesture);

  const handleLikeOnDoubleTap = () => {
    if (!isLiked) {
      onLike();
    }
    heartScale.value = 0;
    heartOpacity.value = 1;
    heartScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    heartOpacity.value = withDelay(600, withTiming(0, { duration: 300 }));
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));

  const renderMedia = () => {
    if (!post.mediaUrl) return null;

    let mediaContent = null;
    if (post.mediaType === "video") {
      mediaContent = (
        <View style={{ flex: 1 }}>
          <VideoView
            player={player}
            nativeControls={false}
            style={styles.mediaImage}
            contentFit="contain"
          />
          {showControls && (
            <Animated.View entering={FadeInUp} style={StyleSheet.absoluteFill}>
              <Pressable
                onPress={() => {
                  if (isPlaying) player.pause();
                  else player.play();
                }}
                style={styles.customVideoOverlay}
              >
                <Animated.View entering={FadeInUp} style={styles.centerIcon}>
                  {isPlaying ? (
                    <Pause
                      size={50}
                      color="white"
                      fill="white"
                      style={{ opacity: 0.8 }}
                    />
                  ) : (
                    <Play
                      size={50}
                      color="white"
                      fill="white"
                      style={{ opacity: 0.8 }}
                    />
                  )}
                </Animated.View>

                <View style={styles.videoActionRow}>
                  <Pressable
                    onPress={() => (player.muted = !isMuted)}
                    style={styles.muteButton}
                  >
                    {isMuted ? (
                      <VolumeX size={18} color="white" />
                    ) : (
                      <Volume2 size={18} color="white" />
                    )}
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* Always-on Insta Progress Bar */}
          <View style={styles.instaProgressBarWrapper}>
            <Animated.View
              style={[styles.instaProgressBar, progressBarStyle]}
            />
          </View>
        </View>
      );
    } else {
      mediaContent = (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.mediaImage}
          contentFit="contain"
        />
      );
    }

    return (
      <GestureDetector gesture={finalGesture}>
        <View style={styles.mediaContainer}>
          {mediaContent}
          <Animated.View
            style={[styles.floatingHeartContainer, animatedHeartStyle]}
            pointerEvents="none"
          >
            <Heart
              size={100}
              color="hsl(345, 60%, 72%)"
              fill="hsl(345, 60%, 72%)"
            />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  };

  return (
    <Animated.View entering={FadeInUp}>
      <Animated.View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.avatarGradient}>
            <Image
              source={{
                uri:
                  post.author?.profileImage ||
                  "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />
          </View>
          <View>
            <Text style={styles.authorName}>
              {post.author?.name || "Unknown"}
            </Text>
            <Text style={styles.date}>
              {moment(post.createdAt).format("MMM D, h:mm a")}
            </Text>
          </View>
        </View>
        {onDelete && (
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Trash2 size={16} color="hsl(35, 10%, 40%)" />
          </Pressable>
        )}
      </View>

      {/* Content */}
      {post.caption ? (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{post.caption}</Text>
        </View>
      ) : null}

      {renderMedia()}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable onPress={onLike} style={styles.actionButton}>
          <Heart
            size={18}
            color={isLiked ? "hsl(345, 60%, 72%)" : "hsl(35, 15%, 50%)"}
            fill={isLiked ? "hsl(345, 60%, 72%)" : "transparent"}
          />
          <Text
            style={[
              styles.actionText,
              isLiked && { color: "hsl(345, 60%, 72%)" },
            ]}
          >
            {post.likes?.length || 0}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowComments(!showComments)}
          style={styles.actionButton}
        >
          <MessageCircle size={18} color="hsl(35, 15%, 50%)" />
          <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
        </Pressable>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsList}>
            {post.comments?.map((comment: any, idx: number) => (
              <View key={idx} style={styles.commentItem}>
                <Image
                  source={{
                    uri:
                      comment.author?.profileImage ||
                      "https://via.placeholder.com/100",
                  }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>
                    {comment.author?.name || "Unknown"}
                  </Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <Text style={styles.noComments}>
                No comments yet. Say something! ❤️
              </Text>
            )}
          </View>

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor="hsl(35, 10%, 40%)"
              value={commentText}
              onChangeText={setCommentText}
            />
            <Pressable
              onPress={handleCommentSubmit}
              disabled={!commentText.trim()}
              style={[
                styles.commentSubmit,
                !commentText.trim() && { opacity: 0.5 },
              ]}
            >
              <Send size={16} color="hsl(345, 60%, 72%)" />
            </Pressable>
          </View>
        </View>
      )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "hsl(220, 15%, 10%)",
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "hsl(345, 40%, 30%)",
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  authorName: {
    fontSize: 14,
    color: "hsl(35, 20%, 90%)",
    fontFamily: "Inter-Regular",
    fontWeight: "600",
  },
  date: {
    fontSize: 10,
    color: "hsl(35, 10%, 40%)",
    fontFamily: "Inter-Regular",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "hsl(35, 20%, 80%)",
    fontFamily: "Inter-Regular",
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 1, // Default for feed
    backgroundColor: "transparent",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  mediaPlaceholder: {
    height: 200,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 13,
    color: "hsl(35, 15%, 50%)",
    fontFamily: "Inter-Regular",
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    padding: 16,
    backgroundColor: "hsl(220, 15%, 11%)",
  },
  commentsList: {
    gap: 12,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 12%)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentAuthor: {
    fontSize: 11,
    color: "hsl(345, 60%, 72%)",
    fontWeight: "600",
    fontFamily: "Inter-Regular",
  },
  commentText: {
    fontSize: 12,
    color: "hsl(35, 15%, 75%)",
    fontFamily: "Inter-Regular",
    marginTop: 2,
  },
  noComments: {
    fontSize: 11,
    color: "hsl(35, 10%, 40%)",
    textAlign: "center",
    fontStyle: "italic",
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 12%)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "hsl(35, 20%, 80%)",
    fontSize: 13,
    fontFamily: "Inter-Regular",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  commentSubmit: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(235, 133, 159, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeartContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  customVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)", // Much more subtle
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  centerIcon: {
    padding: 20,
    borderRadius: 50,
  },
  videoActionRow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  muteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instaProgressBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2, // Even thinner line
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  instaProgressBar: {
    height: "100%",
    backgroundColor: "hsl(345, 60%, 72%)", // Pink theme color 
  },
});
