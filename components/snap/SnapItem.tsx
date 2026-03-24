import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { Image } from "expo-image";
import moment from "moment";
import React, { useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { Heart, MessageCircle, Trash2, Play, Pause, Send } from "lucide-react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  FadeInUp,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface Snap {
  _id: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  likes: string[];
  comments: any[];
  author: { _id: string; name: string; profileImage: string };
  createdAt: string;
}

interface SnapItemProps {
  snap: Snap;
  onLike: () => void;
  onComment: (text: string) => void;
  onDelete?: () => void;
  currentUser: any;
  isViewable?: boolean;
}

export default function SnapItem({
  snap,
  onLike,
  onComment,
  onDelete,
  currentUser,
  isViewable = false,
}: SnapItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showControls, setShowControls] = useState(false);

  const player = useVideoPlayer(snap.mediaUrl, (player) => {
    player.loop = true;
  });

  const playingEvent = useEvent(player, "playingChange");
  const isPlaying = playingEvent ? playingEvent.isPlaying : player.playing;

  const timeUpdate = useEvent(player, "timeUpdate");
  const currentTime = timeUpdate ? timeUpdate.currentTime : player.currentTime;
  const duration = player.duration;

  React.useEffect(() => {
    if (isViewable) {
      player.play();
    } else {
      player.pause();
      setShowControls(false); // Reset controls when scrolled away
    }
  }, [isViewable, player]);

  const isLiked =
    currentUser && snap.likes?.some((id) => id === currentUser.id);

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

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onComment(commentText);
    setCommentText("");
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));

  const renderMedia = () => {
    if (!snap.mediaUrl) return null;

    let mediaContent = null;
    if (snap.mediaType === "video") {
      mediaContent = (
        <View style={{ flex: 1 }}>
          <VideoView
            player={player}
            nativeControls={false}
            style={styles.media}
            contentFit="contain"
          />
          {showControls && (
            <Animated.View entering={FadeInUp} style={StyleSheet.absoluteFill}>
              <Animated.View style={styles.customVideoOverlay}>
              <Pressable 
                onPress={() => {
                  if (isPlaying) {
                    player.pause();
                  } else {
                    player.play();
                  }
                }}
                style={styles.playPauseButton}
              >
                {isPlaying ? (
                  <Pause size={40} color="white" fill="white" />
                ) : (
                  <Play size={40} color="white" fill="white" />
                )}
              </Pressable>
              
              <View style={styles.progressBarWrapper}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(currentTime / (duration || 1)) * 100}%` }
                  ]} 
                />
              </View>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      );
    } else if (snap.mediaType === "image") {
      mediaContent = (
        <Image
          source={{ uri: snap.mediaUrl }}
          style={styles.media}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      );
    } else {
      return null;
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
    <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
      <Animated.View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  snap.author?.profileImage || "https://via.placeholder.com/40",
              }}
              style={styles.avatar}
            />
          </View>
          <View>
            <Text style={styles.authorName}>
              {snap.author?.name || "Unknown"}
            </Text>
            <Text style={styles.date}>
              {moment(snap.createdAt).format("MMM D, h:mm a")}
            </Text>
          </View>
        </View>
        {(currentUser?.role === "admin" ||
          currentUser?.id === snap.author?._id) &&
          onDelete && (
            <Pressable onPress={onDelete} style={styles.deleteButton}>
              <Trash2 size={16} color="hsl(35, 20%, 40%)" />
            </Pressable>
          )}
      </View>

      {/* Caption */}
      {snap.caption && snap.caption !== "✨" && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{snap.caption}</Text>
        </View>
      )}

      {/* Media */}
      {renderMedia()}

      {/* Actions */}
      <View style={styles.actionsBox}>
        <Pressable onPress={onLike} style={styles.actionButton}>
          <Heart
            size={18}
            color={isLiked ? "hsl(345, 60%, 72%)" : "hsl(35, 20%, 50%)"}
            fill={isLiked ? "hsl(345, 60%, 72%)" : "transparent"}
          />
          <Text
            style={[
              styles.actionText,
              isLiked && { color: "hsl(345, 60%, 72%)" },
            ]}
          >
            {snap.likes?.length || 0}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowComments(!showComments)}
          style={styles.actionButton}
        >
          <MessageCircle size={18} color="hsl(35, 20%, 50%)" />
          <Text style={styles.actionText}>{snap.comments?.length || 0}</Text>
        </Pressable>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsList}>
            {snap.comments?.map((comment: any, idx: number) => (
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
            {(!snap.comments || snap.comments.length === 0) && (
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 24,
    overflow: "hidden",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "hsl(345, 40%, 30%)",
    overflow: "hidden",
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  authorName: {
    color: "hsl(35, 20%, 90%)",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    fontWeight: "500",
  },
  date: {
    color: "hsl(35, 20%, 50%)",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter-Regular",
  },
  deleteButton: {
    padding: 8,
  },
  captionContainer: {
    padding: 20,
  },
  captionText: {
    color: "hsl(35, 20%, 80%)",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter-Regular",
  },
  mediaContainer: {
    width: "100%",
    height: width * 1.1,
    backgroundColor: "black",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  actionsBox: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: "hsl(35, 20%, 50%)",
    fontSize: 14,
    fontFamily: "Inter-Regular",
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
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "hsl(345, 60%, 72%)",
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
});
