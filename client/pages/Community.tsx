import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Clock,
  Send,
  Link,
  Twitter,
  Facebook,
  Copy,
  X,
} from "lucide-react";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  title: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  tags: string[];
  commentsList?: Comment[];
}

export default function Community() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  // New post form state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  // Initialize with sample community data
  React.useEffect(() => {
    if (posts.length === 0) {
      setPosts([
        {
          id: "1",
          author: {
            name: "Dr. Sarah Johnson",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
            role: "Professor",
          },
          title: "Tips for Effective Online Learning",
          content:
            "After years of teaching, I've compiled some essential strategies that help students excel in virtual environments. Here are my top recommendations for staying engaged and productive...",
          category: "Education",
          timestamp: "2 hours ago",
          likes: 42,
          comments: 18,
          shares: 7,
          isLiked: false,
          tags: ["teaching", "online-learning", "tips"],
          commentsList: [
            {
              id: "c1",
              author: {
                name: "Student Mike",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
                role: "Student",
              },
              content:
                "This is really helpful! Thank you for sharing these tips.",
              timestamp: "1 hour ago",
              likes: 5,
              isLiked: false,
            },
          ],
        },
        {
          id: "2",
          author: {
            name: "Alex Chen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
            role: "Student",
          },
          title: "Study Group for Advanced Mathematics",
          content:
            "Looking for fellow students to form a study group for our upcoming calculus exam. We meet every Tuesday and Thursday at 6 PM via video call. Everyone welcome!",
          category: "Study Groups",
          timestamp: "5 hours ago",
          likes: 28,
          comments: 12,
          shares: 3,
          isLiked: true,
          tags: ["mathematics", "study-group", "calculus"],
          commentsList: [],
        },
        {
          id: "3",
          author: {
            name: "Prof. Michael Rodriguez",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
            role: "Professor",
          },
          title: "New AI Research Lab Opening",
          content:
            "Exciting news! We're launching a new AI research lab focused on educational technology. Looking for motivated students and researchers to join our team. Applications open next week.",
          category: "Announcements",
          timestamp: "1 day ago",
          likes: 156,
          comments: 34,
          shares: 25,
          isLiked: false,
          tags: ["ai", "research", "opportunities"],
          commentsList: [
            {
              id: "c2",
              author: {
                name: "Dr. Lisa Wang",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
                role: "Professor",
              },
              content:
                "Exciting opportunity! I'm definitely interested in collaborating.",
              timestamp: "12 hours ago",
              likes: 8,
              isLiked: true,
            },
            {
              id: "c3",
              author: {
                name: "John Smith",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
                role: "Student",
              },
              content:
                "When will applications be available? Looking forward to applying!",
              timestamp: "8 hours ago",
              likes: 3,
              isLiked: false,
            },
          ],
        },
      ]);
    }
  }, []);

  const categories = [
    { id: "all", label: "All Posts", count: posts.length },
    {
      id: "education",
      label: "Education",
      count: posts.filter((p) => p.category === "Education").length,
    },
    {
      id: "study-groups",
      label: "Study Groups",
      count: posts.filter((p) => p.category === "Study Groups").length,
    },
    {
      id: "announcements",
      label: "Announcements",
      count: posts.filter((p) => p.category === "Announcements").length,
    },
    {
      id: "resources",
      label: "Resources",
      count: posts.filter((p) => p.category === "Resources").length,
    },
  ];

  // Get recent posts for sidebar
  const recentPosts = posts
    .sort((a, b) => new Date().getTime() - new Date().getTime()) // In real app, use actual timestamp
    .slice(0, 5);

  // Handle new post submission
  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: {
        name: "Current User", // In real app, get from auth context
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser",
        role: "Student", // In real app, get from user profile
      },
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      tags: newPost.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      commentsList: [],
    };

    setPosts((prev) => [post, ...prev]);

    toast({
      title: "Post created!",
      description: "Your post has been published to the community.",
    });

    // Reset form
    setNewPost({ title: "", content: "", category: "", tags: "" });
    setIsPostDialogOpen(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  const handleCommentClick = (post: CommunityPost) => {
    // Get the most current version of the post from state
    const currentPost = posts.find((p) => p.id === post.id) || post;
    setSelectedPost(currentPost);
    setIsCommentsDialogOpen(true);
  };

  const handleShareClick = (post: CommunityPost) => {
    // Get the most current version of the post from state
    const currentPost = posts.find((p) => p.id === post.id) || post;
    setSelectedPost(currentPost);
    setIsShareDialogOpen(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: "Current User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser",
        role: "Student",
      },
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: post.comments + 1,
              commentsList: [...(post.commentsList || []), comment],
            }
          : post,
      ),
    );

    setNewComment("");
    toast({
      title: "Comment added!",
      description: "Your comment has been posted.",
    });
  };

  const handleLikeComment = (commentId: string) => {
    if (!selectedPost) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              commentsList: post.commentsList?.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !comment.isLiked,
                      likes: comment.isLiked
                        ? comment.likes - 1
                        : comment.likes + 1,
                    }
                  : comment,
              ),
            }
          : post,
      ),
    );
  };

  const handleShare = (platform: string) => {
    if (!selectedPost) return;

    const shareUrl = `${window.location.origin}/community/post/${selectedPost.id}`;
    const shareText = `Check out this post: ${selectedPost.title}`;

    switch (platform) {
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Post link has been copied to clipboard.",
        });
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;
    }

    // Update share count
    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? { ...post, shares: post.shares + 1 }
          : post,
      ),
    );

    setIsShareDialogOpen(false);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      post.category.toLowerCase().replace(" ", "-") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const PostCard = ({ post }: { post: CommunityPost }) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>
              {post.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{post.author.role}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{post.content}</p>
      </div>

      {/* Category and Tags */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {post.category}
        </Badge>
        {post.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            #{tag}
          </Badge>
        ))}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${post.isLiked ? "text-red-500" : "text-gray-500"}`}
            onClick={() => handleLikePost(post.id)}
          >
            <Heart
              className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`}
            />
            <span>{post.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600"
            onClick={() => handleCommentClick(post)}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-500 hover:text-green-600"
            onClick={() => handleShareClick(post)}
          >
            <Share2 className="w-4 h-4" />
            <span>{post.shares}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const RecentPostItem = ({ post }: { post: CommunityPost }) => (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <Avatar className="w-8 h-8">
        <AvatarImage src={post.author.avatar} />
        <AvatarFallback>
          {post.author.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {post.title}
        </h4>
        <p className="text-xs text-gray-500">
          {post.author.name} • {post.timestamp}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {post.comments}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dashboard-title">
              Community
            </h1>
            <p className="text-gray-600 mt-1 dashboard-text">
              Connect, share knowledge, and collaborate with fellow learners and
              educators
            </p>
          </div>

          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter post title"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) =>
                      setNewPost((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Study Groups">Study Groups</SelectItem>
                      <SelectItem value="Announcements">
                        Announcements
                      </SelectItem>
                      <SelectItem value="Resources">Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="What would you like to share with the community?"
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    value={newPost.tags}
                    onChange={(e) =>
                      setNewPost((prev) => ({ ...prev, tags: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPostDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Sidebar - Search & Categories */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </Card>

            {/* Categories */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Main Feed */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {posts.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No posts found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Be the first to start a conversation in the community"}
                  </p>
                </Card>
              )}
            </div>
          </motion.div>

          {/* Right Sidebar - Recent Posts */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Posts
              </h3>
              <div className="space-y-2">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <RecentPostItem key={post.id} post={post} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent posts yet
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Comments Dialog */}
      <Dialog
        open={isCommentsDialogOpen}
        onOpenChange={setIsCommentsDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              {/* Post Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedPost.author.avatar} />
                    <AvatarFallback>
                      {selectedPost.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {selectedPost.author.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {selectedPost.timestamp}
                    </p>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {selectedPost.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {selectedPost.content}
                </p>
              </div>

              {/* Add Comment */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser" />
                    <AvatarFallback>CU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="max-h-96 overflow-y-auto space-y-4">
                {selectedPost.commentsList &&
                selectedPost.commentsList.length > 0 ? (
                  selectedPost.commentsList.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>
                          {comment.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-sm">
                              {comment.author.name}
                            </h5>
                            <Badge variant="outline" className="text-xs">
                              {comment.author.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {comment.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs ${comment.isLiked ? "text-red-500" : "text-gray-500"}`}
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            <Heart
                              className={`w-3 h-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`}
                            />
                            {comment.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              {/* Post Preview */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {selectedPost.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {selectedPost.content}
                </p>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleShare("copy")}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Copy Link
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleShare("twitter")}
                >
                  <Twitter className="w-4 h-4 mr-3" />
                  Share on Twitter
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleShare("facebook")}
                >
                  <Facebook className="w-4 h-4 mr-3" />
                  Share on Facebook
                </Button>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsShareDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
