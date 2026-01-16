const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
  path: "/socket.io"
}); 

const port = 4000;

// MongoDB connection
mongoose.connect('mongodb+srv://mohammadrehan00121:eUl2a3vgQ4zhyLic@cluster0.fme9f.mongodb.net/Chat')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  image: String,
  lastSeen: { type: Date, default: null }  // Add lastSeen field

});
const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Socket.IO events for signup, login, message sending & fetching
io.on('connection', (socket) => {
  console.log('🟢 A client connected:', socket.id);

  socket.on("signup", async (userData) => {
    try {
      const { name, email, password, image } = userData;
      console.log("imag", image);
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        socket.emit("signup_error", { error: "Email already in use." });
        return;
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user instance
      const newUser = new User({
        name,
        email,
        password: hashedPassword,  // Store hashed password
        image: image,
      });

      // Save the user to the database
      const savedUser = await newUser.save();

      // Emit success event with the user data (exclude password)
      const userWithoutPassword = savedUser.toObject();
      delete userWithoutPassword.password;  // Remove password from response

      socket.emit("signup_success", userWithoutPassword);

      console.log("New user created: ", userWithoutPassword);
    } catch (err) {
      console.error(err);
      socket.emit("signup_error", { error: "An error occurred during signup." });
    }
  });

  // Login event
  socket.on('login', async (data) => {
    const { email, password } = data;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        socket.emit('login_error', { error: 'User not found' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        socket.emit('login_error', { error: 'Invalid password' });
        return;
      }

      const token = jwt.sign({ id: user._id }, 'SECRET_KEY');
      socket.userId = user._id; // Store userId on the socket object
      socket.emit('login_success', { token, user });
    } catch (err) {
      socket.emit('login_error', { error: 'Login failed', details: err.message });
    }
  });
  function formatLastSeen(timestamp) {
    if (!timestamp) return 'Last seen: unknown';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Online';
    if (diffMin < 60) return `Last seen ${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `Last seen ${diffHr} hr ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `Last seen ${diffDay} day(s) ago`;
  }


  // Send message event
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, message } = data;
      const newMessage = new Message({ senderId, receiverId, message });
      const savedMessage = await newMessage.save();

      io.emit('new_message', savedMessage); // Broadcast to all clients
      socket.emit('message_sent', savedMessage); // Notify sender
    } catch (err) {
      socket.emit('message_error', { error: 'Message sending failed', details: err.message });
    }
  });

  // Get messages event
  socket.on('get_messages', async (data) => {
    const { senderId, receiverId } = data;
    try {
      const messages = await Message.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }).sort({ timestamp: 1 });

      socket.emit('messages', messages);
    } catch (err) {
      socket.emit('message_error', { error: 'Failed to fetch messages', details: err.message });
    }
  });

  // Get all users event
  // Get all users event
  socket.on('get_users', async () => {
    try {
      const users = await User.find();
      const usersWithFormattedLastSeen = users.map(user => ({
        ...user.toObject(),
        lastSeenFormatted: formatLastSeen(user.lastSeen)
      }));
      socket.emit('users', usersWithFormattedLastSeen); // Emit all users with lastSeen formatted
    } catch (err) {
      socket.emit('user_error', { error: 'Failed to fetch users', details: err.message });
    }
  });


  socket.on("disconnect", async () => {
    console.log("A user disconnected");
    try {
      const userId = socket.userId;  // Assuming you store the user ID on socket after login
      if (userId) {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      }
    } catch (err) {
      console.error("Error updating last seen:", err);
    }
  });


});

// POST endpoint for uploading the image (to be used by frontend to send image)
app.post("/upload", upload.single("profile"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send({ filePath: `/uploads/${file.filename}` });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server + Socket.IO running at http://localhost:${port}`);
});




CREATE TABLE `admin` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT 'admin',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `article` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category_id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `article` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `article` (`id`, `title`, `category_id`, `content`, `tags`, `status`, `article`, `created_at`, `updated_at`) VALUES
(5, 'Optimizing CPU Resource Usage for High-Performance Applications', 15, 'Efficient CPU usage is critical for developing high-performance applications. Proper resource management not only improves speed and responsiveness but also reduces infrastructure costs.', 'CPU', '1', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747216686/qbb6cyqeybvnjngqcbfy.png', '2025-05-14 09:58:06', '2025-05-14 09:58:06'),
(6, 'Best Practices for Managing CPU Resources in Scalable Systems', 12, 'Optimizing code by reducing unnecessary loops, memory allocations, and using efficient algorithms helps lower CPU overhead. Choosing the right data structures can also make a significant difference.\r\n\r\nMulti-threading allows systems to better utilize multi-core processors. However, using thread pools and limiting thread counts ensures that performance isn’t lost to context switching.\r\n\r\nAssigning CPU affinity can further optimize resource usage by binding processes to specific cores, improving cache efficiency and task consistency.\r\n\r\nRegular profiling and system audits ensure long-term performance. This proactive approach helps spot regressions and keeps resource usage in check.', 'Devops', '1', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747217781/caiyvjjvfpesuesxjglj.png', '2025-05-14 10:16:21', '2025-05-14 10:16:21'),
(7, 'Understanding and Optimizing CPU Resources in Modern Applications', 15, 'Efficient management of CPU resources is vital in building reliable and scalable software systems. As modern applications grow in complexity, understanding how to monitor and optimize CPU usage can significantly improve performance. Tools like top, htop, and perf allow system administrators and developers to analyze CPU load in real-time. Using efficient algorithms, limiting background processes, and implementing multi-threading techniques can help balance load across cores. Setting CPU affinity and minimizing context switching further enhances application responsiveness. Continuous monitoring and profiling ensure sustained performance and help avoid bottlenecks in production environments.', 'Multi-threading', '1', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747217874/surr4n7pht7thcds2pnd.png', '2025-05-14 10:17:55', '2025-05-14 10:17:55'),
(8, 'Maximizing Application Efficiency Through CPU Resource Management', 11, 'Managing CPU resources effectively is a crucial part of maintaining application performance and scalability. With the increasing demand for real-time processing, it\'s essential to understand how CPU utilization impacts system behavior. Tools like htop, perf, and application profilers allow developers to identify performance bottlenecks. Key optimization techniques include using multi-threading carefully, minimizing context switching, and applying CPU affinity to balance loads across cores. Optimizing algorithms and reducing unnecessary computations also contribute to lower CPU usage. A well-tuned system leads to faster applications, better user experience, and more efficient infrastructure usage.\r\n\r\n', 'Scalability', '1', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747218092/wpxn1x8oloyy9d3eezef.png', '2025-05-14 10:21:33', '2025-05-14 10:21:33');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `fcmToken` varchar(250) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `fcmToken`, `category_name`, `created_at`, `updated_at`) VALUES
(11, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Data Science', '2025-05-13 10:26:08', '2025-05-13 10:26:08'),
(12, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Artificial Intelligence', '2025-05-13 10:26:23', '2025-05-13 10:26:23'),
(13, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Web Development', '2025-05-13 10:26:36', '2025-05-13 10:26:36'),
(14, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Cyber Security', '2025-05-13 10:26:49', '2025-05-13 10:26:49'),
(15, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Mobile App Development', '2025-05-13 10:27:35', '2025-05-13 10:27:35'),
(16, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'UI/UX Design', '2025-05-13 10:27:47', '2025-05-13 10:27:47'),
(17, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Machine Learning', '2025-05-13 10:27:56', '2025-05-13 10:27:56'),
(18, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Digital Marketing', '2025-05-13 10:28:17', '2025-05-13 10:28:17'),
(19, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Photography & Video Editing', '2025-05-13 10:28:29', '2025-05-13 10:28:29'),
(20, 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'Music Production', '2025-05-13 10:29:02', '2025-05-13 10:29:02');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_template`
--

CREATE TABLE `certificate_template` (
  `id` int(11) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `category_id` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  `template_size` varchar(100) DEFAULT NULL,
  `border_style` varchar(100) DEFAULT NULL,
  `certificate` varchar(255) DEFAULT NULL,
  `certificate_content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_template`
--

INSERT INTO `certificate_template` (`id`, `template_name`, `category_id`, `status`, `template_size`, `border_style`, `certificate`, `certificate_content`) VALUES
(1, 'test1', 6, '', 'A4', 'None', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1746185970/xhgb3xeznlqgcjso35yc.png', 'This is content'),
(2, 'test', 6, '1', 'A4', 'None', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1746185306/qkiemxa7by3zd47yxykv.png', 'This is content '),
(3, 'test1', 6, '', 'A4', 'None', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1746185362/qigl5tmr3hn71ja5ium4.png', 'This is content ');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_title` varchar(255) NOT NULL,
  `instructor_id` varchar(255) NOT NULL,
  `course_description` text DEFAULT NULL,
  `course_image` varchar(255) DEFAULT NULL,
  `course_type` varchar(255) DEFAULT NULL,
  `course_price` varchar(255) DEFAULT NULL,
  `course_syllabus` text DEFAULT NULL,
  `fcmToken` varchar(250) NOT NULL,
  `course_content_video_link` varchar(255) DEFAULT NULL,
  `test_video` varchar(255) DEFAULT NULL,
  `faqs` text DEFAULT NULL,
  `status` varchar(25) DEFAULT NULL,
  `category_id` varchar(25) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_title`, `instructor_id`, `course_description`, `course_image`, `course_type`, `course_price`, `course_syllabus`, `fcmToken`, `course_content_video_link`, `test_video`, `faqs`, `status`, `category_id`, `created_at`, `updated_at`) VALUES
(14, 'Complete Data Science Bootcamp 2025', '8', 'Master data science from scratch: Python, Machine Learning, Data Visualization, and Real Projects', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747134010/yvvp35vmto3n9afyrmy8.webp', 'Live', '5656', '[{\"module_title\":\"Introduction to Data Science\",\"module_syllabus\":\"Understand the basics of data science and its real-world applications.\"},{\"module_title\":\"Python for Data Science\",\"module_syllabus\":\"Learn Python programming essentials for data analysis and manipulation.\"}]', 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'https://www.youtube.com/embed/E6qHBLqZ7UU?si=YDLWvqPcTcfbkMMp', 'https://res.cloudinary.com/de1s1o9xc/video/upload/v1747134014/j0jxnnsuxxcfooy3wodf.mp4', '[{\"question\":\"Do I need prior programming knowledge?\",\"answer\":\"No, this course covers everything from scratch.\"},{\"question\":\"Is there a certificate of completion?\",\"answer\":\"Yes, you will receive a certificate after completing the course.\"}]', '1', '11', '2025-05-13 11:00:15', '2025-05-13 11:00:15'),
(15, 'Mastering React for Frontend Development', '8', 'Learn React from basic to advanced concepts including Hooks, Redux, Routing, and modern UI libraries.', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747134369/ganricrg26ly3lu3grvd.png', 'HyBrid', '5656', '[{\"module_title\":\"React Basics\",\"module_syllabus\":\"JSX, Components, Props & State.\"},{\"module_title\":\"React Router & Forms\",\"module_syllabus\":\"Page navigation and form handling\"}]', 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'https://www.youtube.com/embed/dCLhUialKPQ?si=mib6lCoH2kC9uwIh', 'https://res.cloudinary.com/de1s1o9xc/video/upload/v1747134372/bpy6h6jkehvy0z52vvk6.mp4', '[{\"question\":\"Is React easy to learn?\",\"answer\":\"Yes, with practice and this course it becomes easy.\"},{\"question\":\"Are projects included?\",\"answer\":\"yes, you\'ll build real-world projects.\"}]', '1', '13', '2025-05-13 11:06:13', '2025-05-13 11:06:13'),
(16, 'Cyber Security Essentials 2025', '8', 'Protect yourself and your business from cyber threats by mastering ethical hacking and security protocols.', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747134728/fxku2morxvgsxrghdpfd.jpg', 'HyBrid', '676', '[{\"module_title\":\"Cyber Threat Landscape\",\"module_syllabus\":\"Understand common cyber attacks.\"},{\"module_title\":\"Network Security Basics\",\"module_syllabus\":\"Fundamentals of secure networking.\"}]', 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'https://www.youtube.com/embed/dCLhUialKPQ?si=mib6lCoH2kC9uwIh', 'https://res.cloudinary.com/de1s1o9xc/video/upload/v1747134731/lxcvg9te4zgdd4vyodnx.mp4', '[{\"question\":\"Is this course beginner friendly\",\"answer\":\"Absolutely, it starts from scratch.\"},{\"question\":\"Does it cover ethical hacking?\",\"answer\":\"Yes, the basics are included.\"}]', '1', '14', '2025-05-13 11:12:12', '2025-05-13 11:12:12'),
(17, 'Mastering React for Web Development', '11', 'A comprehensive course covering React fundamentals, hooks, state management, routing, and advanced concepts for building production-ready web apps.', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747203646/e3qjbfiwvut8lwnjtjx5.webp', 'Live', '5656', '[{\"module_title\":\"Introduction to React\",\"module_syllabus\":\"Learn about React\'s core concepts, component-based architecture, and setting up the development environment.\"},{\"module_title\":\"React Hooks & State Management\",\"module_syllabus\":\"Explore useState, useEffect, custom hooks, and how to manage application state efficiently.\"}]', 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'https://www.youtube.com/embed/E8lXC2mR6-k?si=UV4k8VNCsZD3QzKd', 'https://res.cloudinary.com/de1s1o9xc/video/upload/v1747203650/eystjuauqe3hu0kx5dng.mp4', '[{\"question\":\"Do I need JavaScript experience before taking this course?\",\"answer\":\"Yes, basic JavaScript knowledge is recommended to get the most out of this course.\"},{\"question\":\"Will I receive a certificate upon completion?\",\"answer\":\"Yes, you will receive an industry-recognized certificate after successfully finishing the course.\"}]', '1', '13', '2025-05-14 06:20:51', '2025-05-14 06:20:51'),
(18, 'Mastering React.js & Next.js', '11', 'A complete guide to building high-performance web apps using React and Next.js with real-world projects.', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747205959/lclk9tim3socl6cemsyn.jpg', 'Live', '676', '[{\"module_title\":\"Introduction to React\",\"module_syllabus\":\"Understanding components, props, and state\"},{\"module_title\":\"Advanced React Concepts\",\"module_syllabus\":\"Hooks, Context API, and performance optimization.\"},{\"module_title\":\"Building with Next.js\",\"module_syllabus\":\"Server-side rendering, API routes, and deployment.\"}]', 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'https://www.youtube.com/embed/G2RpHt8NX0o?si=GR8uDNqr-MfXFDAr', 'https://res.cloudinary.com/de1s1o9xc/video/upload/v1747205962/uim1budwo71dcs5yyhib.mp4', '[{\"question\":\"Is prior JavaScript experience required?\",\"answer\":\"Yes, basic understanding of JavaScript is recommended.\"},{\"question\":\"Will I get a certificate?\",\"answer\":\"Yes, a certificate will be provided upon course completion.\"},{\"question\":\"\",\"answer\":\"\"}]', '1', '11', '2025-05-14 06:59:24', '2025-05-14 06:59:24'),
(19, 'Mastering React for Beginners', '12', 'Learn the fundamentals of React.js, including components, hooks, and state management. This beginner-friendly course will help you build dynamic, responsive web apps from scratch.', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747214159/gahxjd1d3etzy0vggxs1.jpg', 'HyBrid', '5656', '[{\"module_title\":\"Introduction to React\",\"module_syllabus\":\"Understand what React is, its key features, and how it compares with other frameworks.\"},{\"module_title\":\"React Components & Props\",\"module_syllabus\":\"Learn how to create functional and class components, use props to pass data, and structure your application.\"},{\"module_title\":\"State and Lifecycle\",\"module_syllabus\":\"Explore how to manage component state, handle events, and use lifecycle methods effectively.\"}]', 'cg5P5sGwiJHCc93AGUahOA:APA91bEbmpiNjx0wcyxF2orNVnYRR2mKEB0MF1qsMIZAvbdECLU97539ix57ye1uqJQ9bP-QJOcNcEbKduMuFGx8YjGQpgAFAHoLWDSPgoX1Rlkg1VSO0LA', 'https://www.youtube.com/embed/E8lXC2mR6-k?si=dvVTOCpKIX8H2Ka9', 'https://res.cloudinary.com/de1s1o9xc/video/upload/v1747214162/crquq4lwvex8ascd4lz8.mp4', '[{\"question\":\"Do I need prior coding experience?\",\"answer\":\"Basic knowledge of JavaScript and HTML/CSS is helpful but not mandatory.\"},{\"question\":\"Will I get a certificate?\",\"answer\":\"Yes, you’ll receive a certificate upon successful course completion.\"}]', '0', '13', '2025-05-14 09:16:03', '2025-05-14 09:16:03');

-- --------------------------------------------------------

--
-- Table structure for table `instructor`
--

CREATE TABLE `instructor` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` varchar(15) DEFAULT 'instructor',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile_number` varchar(15) NOT NULL,
  `expertise` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `is_active` varchar(15) DEFAULT '1',
  `bank_account_number` varchar(20) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `forgot_password_token` varchar(255) NOT NULL,
  `reset_token_expiry` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `instructor`
--

INSERT INTO `instructor` (`id`, `full_name`, `role`, `email`, `password`, `mobile_number`, `expertise`, `profile_image`, `is_active`, `bank_account_number`, `ifsc_code`, `created_at`, `updated_at`, `forgot_password_token`, `reset_token_expiry`) VALUES
(1, 'John Doe', 'instructor', 'instructor@gmail.com', '$2b$10$1sAZW.5J09qjXdWA/9SmOOfMyObin8QkyKzFUFCV5RMFS5wRMFxT6', '1234567890', 'Mathematics', 'image_url_here', '1', '123456789012', 'ABCD1234567', '2025-05-01 11:04:18', '2025-05-02 12:53:53', '', ''),
(8, 'Instructort', 'instructor', 'Instructortest@gmail.com', '$2b$10$BPXHdATSF7FkVcNwoBCDYuL7laMCaPDe2oOz6B3Nb8BKbI8wHJr5.', '46546656', 'Science', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1746172558/wpxrlb7rwudnv2nnfvwj.png', '1', '4545545', '545', '2025-05-02 07:07:53', '2025-05-02 12:26:16', '', ''),
(9, 'veni  yadav', 'instructor', 'veni@gmail.com', '$2b$10$X8bXSCu9tvSaEhlB9sqIRuBDOBJ6yqqwGgNxrQppGgvSwuFAnlHzy', '867677665', 'social Science', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1746169768/zywq7govyxgkz1wfwqx6.webp', '0', '6757655', '6566', '2025-05-02 07:09:29', '2025-05-02 12:28:52', '', ''),
(10, 'test', 'instructor', 'test@gmail.comaaa', '$2b$10$/4Hq5M092AOBodaO94vtSuvHEPmAtrOjZ9SlCJfv22viGJRsDOnaa', '216548976', '321564987', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1746188815/gcipatnzbjgu9oqiucun.webp', '1', '213654987', '12564987', '2025-05-02 12:26:55', '2025-05-13 11:22:35', '', ''),
(11, 'raj', 'instructor', 'raj@gmail.com', '$2b$10$/JcHGuj5AbxfO3EvwDEkO.aRZ9Ap1Dlkldx7hk6gtdZe9TAZTETUe', '46546656', 'web developer', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747135331/rnlvnurgg2yjr2m8lvvb.webp', '1', '565655', '6565', '2025-05-13 11:22:11', '2025-05-15 09:56:09', '', ''),
(12, 'teacher', 'instructor', 'teacher@gmail.com', '$2a$12$DpqDl7CQMoRzrYaUMSVKO.Zs5RSvdNch7Lr9rfXhkBy7R5t.0s4xC', '7867868', 'Sr Mern Developer', 'https://res.cloudinary.com/de1s1o9xc/image/upload/v1747220240/fy1sdudufbppylr4c0zj.png', '1', '676768787', '67677', '2025-05-14 08:27:14', '2025-05-15 10:06:14', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`, `updated_at`) VALUES
(35, 1, 1, 'hi', '2025-05-15 09:15:45', '2025-05-15 09:15:45'),
(36, 1, 9, 'hi', '2025-05-15 09:33:17', '2025-05-15 09:33:17'),
(37, 1, 8, 'hello ', '2025-05-15 10:00:37', '2025-05-15 10:00:37'),
(38, 1, 8, 'how are you ', '2025-05-15 10:00:44', '2025-05-15 10:00:44'),
(39, 1, 12, 'instrcutior ne techer ko message kiya ', '2025-05-15 10:09:43', '2025-05-15 10:09:43'),
(40, 1, 12, 'ha ', '2025-05-15 10:18:40', '2025-05-15 10:18:40'),
(41, 12, 1, 'real time update nahi ho raha hai ', '2025-05-15 10:19:11', '2025-05-15 10:19:11'),
(42, 12, 8, 'jyjyj', '2025-05-15 10:28:13', '2025-05-15 10:28:13'),
(43, 12, 1, 'ha ', '2025-05-15 10:36:19', '2025-05-15 10:36:19'),
(44, 12, 1, 'yes', '2025-05-15 10:36:46', '2025-05-15 10:36:46'),
(45, 1, 12, 'ubvbfjkbfkjvb', '2025-05-15 10:40:15', '2025-05-15 10:40:15'),
(46, 1, 12, 'egrr', '2025-05-15 10:42:39', '2025-05-15 10:42:39'),
(47, 12, 1, 'grggrg', '2025-05-15 10:42:53', '2025-05-15 10:42:53'),
(48, 1, 12, 'fbttb', '2025-05-15 10:44:11', '2025-05-15 10:44:11'),
(49, 1, 12, 'efgreg', '2025-05-15 10:45:30', '2025-05-15 10:45:30'),
(50, 1, 12, 'grth', '2025-05-15 10:45:44', '2025-05-15 10:45:44'),
(51, 12, 1, 'hi', '2025-05-15 10:48:02', '2025-05-15 10:48:02'),
(52, 12, 1, 'grgrg', '2025-05-15 10:48:07', '2025-05-15 10:48:07'),
(53, 1, 12, 'hgth', '2025-05-15 10:48:35', '2025-05-15 10:48:35');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_type` varchar(250) NOT NULL,
  `author` varchar(250) NOT NULL,
  `product_title` varchar(255) NOT NULL,
  `instructor_id` varchar(250) NOT NULL,
  `publish_date` varchar(250) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `regular_price` varchar(255) NOT NULL,
  `sale_price` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `product_images` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_type`, `author`, `product_title`, `instructor_id`, `publish_date`, `category_id`, `description`, `regular_price`, `sale_price`, `status`, `product_images`, `created_at`, `updated_at`) VALUES
(9, 'ebook ', 'WebGuru', 'Ultimate SEO Guide 2025', '11', '2025-05-21', '12', 'Master SEO fundamentals & advanced strategies to rank your website.', '89', '70', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747136329/jpw2gruuh0lgqaxjvqow.png\"]', '2025-05-13 11:38:49', '2025-05-13 11:38:49'),
(10, 'ebook', 'WebGuru', 'React Frontend Crash Course', '11', '2025-05-22', '12', '4-hour beginner to advanced React tutorial series with practical projects.', '78', '55', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747136379/khhvlkrqdpjdepl4r1ln.png\"]', '2025-05-13 11:39:39', '2025-05-13 11:39:39'),
(11, 'ebook demo', 'By Glow Up Academy', 'Cinematic Background Music Pack', '11', '2025-05-30', '', 'A pack of 20 high-quality royalty-free cinematic background tracks for videos, films, and podcasts.', '78', '70', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747136482/f53niifgolr5gxxfesrd.png\"]', '2025-05-13 11:41:22', '2025-05-13 11:42:14'),
(12, 'Figma File', 'UIExperts', 'Modern SaaS Dashboard UI Kit', '1', '2025-05-22', '12', 'A complete Figma UI Kit for modern SaaS dashboards — 50+ ready-to-use screens and components.', '656', '565', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747137021/ajultat0zpjj1fnqebnf.png\"]', '2025-05-13 11:50:22', '2025-05-15 08:09:21'),
(13, 'Printable ', 'CreativeDecor', 'Motivational Quote Wall Art Bundle', '1', '2025-05-14', '', '10 high-resolution printable posters with motivational quotes — perfect for home & office décor', '65', '44', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747137119/fibwezjbdqio3slzvctg.png\"]', '2025-05-13 11:51:43', '2025-05-15 08:10:07'),
(14, 'PDF E-Book', 'CodePro Publications', 'JavaScript Mastery: From Beginner to Pro', '1', '2025-05-22', '12', 'A 300-page detailed guide covering everything from JavaScript fundamentals to advanced topics with real-world projects', '70', '50', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747137214/bkomxccdwe6fn1ttyl8z.png\"]', '2025-05-13 11:53:34', '2025-05-13 11:53:34'),
(15, 'Website Service', 'TechWeb Corp', 'SuperFast Hosting Service', '1', '2025-05-21', '12', 'A high-performance web hosting service that provides reliable uptime, fast loading speeds, and seamless integration with modern website technologies. Perfect for businesses and individuals', '787', '676', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747141835/ismifwzfv8maal2bkenx.png\"]', '2025-05-13 13:10:35', '2025-05-13 13:10:35'),
(16, 'Website Service', 'DevStudio ', 'Pro Web Development Package', '1', '2025-05-24', '11', 'An all-in-one web development package that includes website design, development, and optimization. Perfect for startups and small businesses looking to establish a professional online presence.', '676', '672', '1', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747142541/gbqzjlnmw1sa1vkfo4nt.png\"]', '2025-05-13 13:22:22', '2025-05-13 13:22:22'),
(17, 'Digital Download', 'smart school', 'Pro UI Design Kit', '12', '2025-05-24', '11', 'A complete UI/UX design kit for modern web and mobile app interfaces. Includes ready-made components, icons, and templates in Figma, Sketch, and Adobe XD formats.', '765', '564', '0', '[\"https://res.cloudinary.com/de1s1o9xc/image/upload/v1747214475/dglwm1lkrrpvmrkwaboz.png\"]', '2025-05-14 09:21:15', '2025-05-15 09:24:25');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(15) DEFAULT 'student',
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `course_id` varchar(255) NOT NULL,
  `is_active` varchar(15) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `forgot_password_token` varchar(255) NOT NULL,
  `reset_token_expiry` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `name`, `email`, `role`, `mobile`, `password`, `course_id`, `is_active`, `created_at`, `updated_at`, `forgot_password_token`, `reset_token_expiry`) VALUES
(2, 'John Doe', 'dddd@gmail.com', 'student', '11111111111', '$2b$10$5OAwMfXWeapreBBXQ.Gywe2UmUG7uNeBQPrHUWOY6c5LmmU3xNSwK', '[1,2]', '1', '2025-05-01 12:22:45', '2025-05-15 09:54:07', '', ''),
(29, 'John', 'new@gmail.com', 'student', '9876543210', '$2b$10$tSDOuCgZ1rkYf5KRTZixVOeOEpa/26FzpkiMlslDiLGqPw4ijhvPa', '[2]', '1', '2025-05-01 14:19:07', '2025-05-01 14:19:07', '', ''),
(33, 'veni', 'student@gmail.com', 'student', '67868688767', '$2a$12$ppkfldPLvEAsCvAOhGo.Yu.afkQFHscrNQdG1idJy2y848wbcwd9W', '[1,4]', '1', '2025-05-02 12:36:54', '2025-05-02 12:46:13', '', ''),
(35, 'test', 'test@gmail.com', 'student', '676767', '$2b$10$cqke7O2CwKgmtFcN547f7.VYL0cZEP9yIZFSNqiTEDsdcGowR5XaS', '[18]', '1', '2025-05-14 08:28:45', '2025-05-14 12:12:57', '', ''),
(36, 'Jhon ', 'john@gmail.com', 'student', '67676766', '$2b$10$qONxtfj3TpcQkC5EuyqVruutRhKcrKdirVSlQ7yuwud3iKDHDoyc2', '[15,17]', '1', '2025-05-14 09:33:31', '2025-05-14 09:33:31', '', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `article`
--
ALTER TABLE `article`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `certificate_template`
--
ALTER TABLE `certificate_template`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `instructor`
--
ALTER TABLE `instructor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `article`
--
ALTER TABLE `article`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `certificate_template`
--
ALTER TABLE `certificate_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `instructor`
--
ALTER TABLE `instructor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
COMMIT;


ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
COMMIT;


ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `student`
  AUTO_INCREMENT = 37;
COMMIT;

INSERT INTO `admin` (`id`, `name`, `role`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin', 'admin@gmail.com', '$2a$12$2qVg8eJux74piZnh4zoRBuSkiPD3cFnzjmXPxTzLJsHy1hjbw.jMC', '2025-05-01 11:12:05', '2025-05-01 11:12:05');
 
 

ALTER TABLE admin
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE admin
ADD COLUMN admin_id INT NOT NULL;

ALTER TABLE admin
ADD COLUMN avatar INT,
ADD COLUMN address TEXT,
ADD COLUMN phone VARCHAR(15);


CREATE TABLE plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  features JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  plan_id INT NOT NULL,
  billing_type VARCHAR(255) NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AiQuizTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_syllabus_id INT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    `option` TEXT NOT NULL,  -- Wrapped in backticks
    correctAnswerOption INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



ALTER TABLE messages 
ADD sender_role VARCHAR(255)  NOT NULL AFTER sender_id,
ADD receiver_role VARCHAR(255) NOT NULL AFTER receiver_id;

ALTER TABLE course_syllabus 
ADD module_courses LONGTEXT AFTER module_syllabus;


CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  course_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





CREATE TABLE plan_enquiry (
    id SERIAL PRIMARY KEY,                     -- Auto-increment ID
    name VARCHAR(100) NOT NULL,                -- User's name
    phone VARCHAR(15),                         -- Phone number
    message TEXT,                              -- Inquiry message
    plan_name VARCHAR(100) NOT NULL,            -- Selected plan name
    duration VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Created time
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Last update
);
