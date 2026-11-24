
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";

// ---------------- API CONFIGURATION ----------------

const API_URL = "https://kaamconnect-backend-r5m4.onrender.com";

// ---------------- DEMO JOBS ----------------

const initialJobs = [
  {
    id: "1",
    title: "Office Helper",
    company: "Sharma Enterprises",
    city: "Mathura",
    salary: "₹10,000/month",
    type: "Full Time",
    description: "Office cleaning and general assistance."
  },
  {
    id: "2",
    title: "Electrician",
    company: "Power Solutions",
    city: "Mathura",
    salary: "₹700/day",
    type: "Daily Wage",
    description: "Electrical repair and maintenance."
  },
  {
    id: "3",
    title: "Delivery Driver",
    company: "Quick Delivery",
    city: "Vrindavan",
    salary: "₹12,000/month",
    type: "Full Time",
    description: "Local parcel delivery."
  },
  {
    id: "4",
    title: "Shop Assistant",
    company: "City Mart",
    city: "Mathura",
    salary: "₹8,000/month",
    type: "Part Time",
    description: "Customer assistance and shop management."
  }
];

// ---------------- FORM FIELD ----------------

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#929CAA"
      keyboardType={keyboardType || "default"}
    />
  </View>
);

// ---------------- MAIN APP ----------------

export default function App() {
  const [language, setLanguage] = useState("English");
  const [screen, setScreen] = useState("home");
  const [role, setRole] = useState("");

  const [jobs, setJobs] = useState(initialJobs);
  const [applied, setApplied] = useState([]);
  const [search, setSearch] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [isRegistering, setIsRegistering] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    city: "",
    location: "",
    role: "",
    skills: "",
    experience: "",
    salary: "",
    business: "",
    workerType: ""
  });

  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    city: "",
    salary: "",
    type: "Full Time",
    description: ""
  });

  const hi = language === "Hindi";

  // ---------------- LANGUAGE TEXT ----------------

  const t = {
    welcome: hi ? "आपके आस-पास काम के अवसर" : "Opportunities Near You",

    subtitle: hi
      ? "नौकरी खोजें या आसानी से कामगार रखें।"
      : "Find local jobs or hire skilled workers easily.",

    worker: hi ? "मुझे काम चाहिए" : "I'm looking for work",

    employer: hi ? "मुझे कामगार चाहिए" : "I want to hire workers",

    continue: hi ? "आगे बढ़ें" : "Continue to Dashboard",

    search: hi
      ? "नौकरी, कंपनी या शहर खोजें..."
      : "Search job, company or city...",

    available: hi ? "उपलब्ध नौकरियाँ" : "Available Jobs",

    apply: hi ? "आवेदन करें" : "Apply Now",

    applied: hi ? "आवेदन हो गया ✓" : "Applied ✓",

    back: hi ? "होम पर वापस जाएं" : "Back to Home",

    assistant: hi ? "AI सहायक से बात करें" : "Chat with AI Assistant",

    postJob: hi ? "नई नौकरी पोस्ट करें" : "Post a New Job",

    language: hi ? "English" : "हिंदी"
  };

  // ---------------- UPDATE FUNCTIONS ----------------

  const updateProfile = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateJob = (key, value) => {
    setNewJob(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const goHome = () => {
    setScreen("home");
    setRole("");
  };

  const startRegistration = selected => {
    setRole(selected);
    setScreen("register");
  };

  // ---------------- WORKER REGISTRATION WITH SUPABASE ----------------

  const finishRegistration = async () => {
    if (!profile.name.trim() || !profile.phone.trim() || !profile.city.trim()) {
      Alert.alert(
        hi ? "जानकारी अधूरी है" : "Missing Details",
        hi
          ? "कृपया नाम, फोन नंबर और शहर भरें।"
          : "Please enter your name, phone number and city."
      );
      return;
    }

    if (!/^\d{10}$/.test(profile.phone.trim())) {
      Alert.alert(
        hi ? "गलत फोन नंबर" : "Invalid Phone Number",
        hi
          ? "कृपया 10 अंकों का सही फोन नंबर दर्ज करें।"
          : "Please enter a valid 10-digit phone number."
      );
      return;
    }

    // WORKER REGISTRATION

    if (role === "worker") {
      if (!profile.role.trim()) {
        Alert.alert(
          "Missing Worker Role",
          "Please enter your work role, e.g. Electrician or Plumber."
        );
        return;
      }

      if (isRegistering) return;

      setIsRegistering(true);

      try {
        const experienceNumber = parseInt(profile.experience, 10);

        const workerData = {
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          role: profile.role.trim(),
          city: profile.city.trim(),
          experience: Number.isNaN(experienceNumber)
            ? 0
            : experienceNumber,
          skills: profile.skills.trim()
        };

        const response = await fetch(`${API_URL}/workers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(workerData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail
              ? JSON.stringify(data.detail)
              : "Worker registration failed."
          );
        }

        if (!data.success) {
          throw new Error(data.message || "Worker registration failed.");
        }

        setScreen("workerDashboard");

        Alert.alert(
          hi ? "पंजीकरण सफल!" : "Registration Successful!",
          hi
            ? "आपकी जानकारी सफलतापूर्वक Supabase में सेव हो गई है।"
            : "Your worker profile has been saved successfully in Supabase."
        );

        console.log("Worker saved in Supabase:", data.worker);

      } catch (error) {
        console.log("Worker Registration Error:", error);

        Alert.alert(
          hi ? "पंजीकरण विफल" : "Registration Failed",
          error.message || "Unable to connect to the server. Please try again."
        );

      } finally {
        setIsRegistering(false);
      }

      return;
    }

    // EMPLOYER REGISTRATION (EXISTING LOCAL FLOW)

    setScreen("employerDashboard");
  };

  // ---------------- POST JOB ----------------

  const postJob = () => {
    if (
      !newJob.title ||
      !newJob.company ||
      !newJob.city ||
      !newJob.salary
    ) {
      Alert.alert(
        hi ? "जानकारी अधूरी है" : "Missing Details",
        hi
          ? "कृपया नौकरी की सभी जरूरी जानकारी भरें।"
          : "Please fill in the required job details."
      );
      return;
    }

    const job = {
      ...newJob,
      id: Date.now().toString()
    };

    setJobs(prev => [job, ...prev]);

    setNewJob({
      title: "",
      company: "",
      city: "",
      salary: "",
      type: "Full Time",
      description: ""
    });

    setScreen("employerDashboard");

    Alert.alert(
      hi ? "सफलता" : "Success",
      hi
        ? "आपकी नौकरी पोस्ट हो गई!"
        : "Your job has been posted!"
    );
  };

  // ---------------- APPLY FOR JOB ----------------

  const applyJob = id => {
    if (applied.includes(id)) return;

    setApplied(prev => [...prev, id]);

    Alert.alert(
      hi ? "सफलता" : "Success",
      hi
        ? "आपने नौकरी के लिए आवेदन कर दिया!"
        : "Application submitted!"
    );
  };

  // ---------------- JOB SEARCH ----------------

  const filteredJobs = jobs.filter(job =>
    `${job.title} ${job.city} ${job.company}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const employerJobs = jobs.filter(
    job =>
      job.company === profile.business ||
      job.company === profile.name
  );

  // ---------------- AI ASSISTANT ----------------

  const sendMessage = async () => {
    const message = chatInput.trim();

    if (!message) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: message,
        sender: "user"
      }
    ]);

    setChatInput("");

    try {
      const result = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message
        })
      });

      if (!result.ok) {
        throw new Error(`Server error: ${result.status}`);
      }

      const data = await result.json();

      // Backend searches Supabase and prepares the response.
      // Do not filter local demo jobs here.

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.response || "Sorry, I couldn't process your request.",
          sender: "assistant"
        }
      ]);

      console.log("KaamConnect Context:", data.context);
      console.log("Awaiting:", data.awaiting);
      console.log("Database Jobs:", data.jobs);

    } catch (error) {
      console.log("Chat API Error:", error);

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Unable to connect to KaamConnect server. Please try again.",
          sender: "assistant"
        }
      ]);
    }
  };

  // ---------------- HEADER ----------------

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={goHome}>
        <Text style={styles.logo}>💼 KaamConnect</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.language}
        onPress={() =>
          setLanguage(hi ? "English" : "Hindi")
        }
      >
        <Text style={styles.languageText}>
          {t.language}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ---------------- JOB CARD ----------------

  const JobCard = ({ job }) => (
    <View style={styles.jobCard}>
      <Text style={styles.jobTitle}>{job.title}</Text>

      <Text style={styles.company}>🏢 {job.company}</Text>

      <Text style={styles.jobInfo}>📍 {job.city}</Text>

      <Text style={styles.salary}>💰 {job.salary}</Text>

      <Text style={styles.jobInfo}>🕒 {job.type}</Text>

      {!!job.description && (
        <Text style={styles.description}>
          {job.description}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.applyButton,
          applied.includes(job.id) && styles.disabledButton
        ]}
        disabled={applied.includes(job.id)}
        onPress={() => applyJob(job.id)}
      >
        <Text style={styles.buttonText}>
          {applied.includes(job.id)
            ? t.applied
            : t.apply}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ---------------- APP UI ----------------

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#F5F7FB"
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Header />

          {/* HOME SCREEN */}

          {screen === "home" && (
            <View>
              <Text style={styles.heading}>
                {t.welcome}
              </Text>

              <Text style={styles.subtitle}>
                {t.subtitle}
              </Text>

              <View style={styles.hero}>
                <Text style={styles.heroIcon}>🤝</Text>

                <Text style={styles.heroTitle}>
                  KaamConnect
                </Text>

                <Text style={styles.heroText}>
                  Connecting local workers with local employers.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                {hi
                  ? "आप क्या करना चाहते हैं?"
                  : "Get Started"}
              </Text>

              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => startRegistration("worker")}
              >
                <Text style={styles.cardIcon}>👷</Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {t.worker}
                  </Text>

                  <Text style={styles.cardDescription}>
                    {hi
                      ? "अपने आस-पास नौकरी खोजें।"
                      : "Find jobs near you."}
                  </Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => startRegistration("employer")}
              >
                <Text style={styles.cardIcon}>🏢</Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {t.employer}
                  </Text>

                  <Text style={styles.cardDescription}>
                    {hi
                      ? "अपने व्यवसाय के लिए कामगार रखें।"
                      : "Hire workers for your business."}
                  </Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setScreen("assistant")}
              >
                <Text style={styles.buttonText}>
                  🤖 {t.assistant}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* REGISTRATION SCREEN */}

          {screen === "register" && (
            <View>
              <TouchableOpacity onPress={goHome}>
                <Text style={styles.back}>
                  ← {t.back}
                </Text>
              </TouchableOpacity>

              <Text style={styles.heading}>
                {role === "worker"
                  ? hi
                    ? "कामगार पंजीकरण"
                    : "Job Seeker Registration"
                  : hi
                    ? "नियोक्ता पंजीकरण"
                    : "Employer Registration"}
              </Text>

              <Text style={styles.subtitle}>
                {hi
                  ? "आगे बढ़ने के लिए अपनी जानकारी भरें।"
                  : "Enter your details to continue."}
              </Text>

              {role === "employer" && (
                <Field
                  label={hi ? "व्यवसाय का नाम" : "Business Name"}
                  placeholder="Enter business name"
                  value={profile.business}
                  onChangeText={v => updateProfile("business", v)}
                />
              )}

              <Field
                label={hi ? "पूरा नाम" : "Full Name"}
                placeholder="Your full name"
                value={profile.name}
                onChangeText={v => updateProfile("name", v)}
              />

              <Field
                label={hi ? "मोबाइल नंबर" : "Mobile Number"}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                value={profile.phone}
                onChangeText={v => updateProfile("phone", v)}
              />

              <Field
                label={hi ? "शहर" : "City"}
                placeholder="e.g. Mathura"
                value={profile.city}
                onChangeText={v => updateProfile("city", v)}
              />

              <Field
                label={hi ? "इलाका" : "Area / Locality"}
                placeholder="Your locality"
                value={profile.location}
                onChangeText={v => updateProfile("location", v)}
              />

              {role === "worker" ? (
                <>
                  <Field
                    label={hi ? "काम का प्रकार" : "Worker Role"}
                    placeholder="e.g. Electrician, Plumber, Driver"
                    value={profile.role}
                    onChangeText={v => updateProfile("role", v)}
                  />

                  <Field
                    label={hi ? "कौशल" : "Skills"}
                    placeholder="Wiring, Repair, Pipe fitting..."
                    value={profile.skills}
                    onChangeText={v => updateProfile("skills", v)}
                  />

                  <Field
                    label={hi ? "अनुभव" : "Experience (in years)"}
                    placeholder="e.g. 2"
                    keyboardType="numeric"
                    value={profile.experience}
                    onChangeText={v => updateProfile("experience", v)}
                  />

                  <Field
                    label={hi ? "अपेक्षित वेतन" : "Expected Salary"}
                    placeholder="e.g. ₹12,000/month"
                    value={profile.salary}
                    onChangeText={v => updateProfile("salary", v)}
                  />
                </>
              ) : (
                <Field
                  label={hi ? "कितने कामगार चाहिए?" : "Workers Required"}
                  placeholder="e.g. 2 Helpers"
                  value={profile.workerType}
                  onChangeText={v => updateProfile("workerType", v)}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isRegistering && { opacity: 0.6 }
                ]}
                onPress={finishRegistration}
                disabled={isRegistering}
              >
                <Text style={styles.buttonText}>
                  {isRegistering
                    ? "Saving..."
                    : t.continue}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* WORKER DASHBOARD */}

          {screen === "workerDashboard" && (
            <View>
              <Text style={styles.greeting}>
                {hi
                  ? `नमस्ते, ${profile.name}!`
                  : `Welcome, ${profile.name}!`}
              </Text>

              <Text style={styles.heading}>
                {hi
                  ? "अपने लिए काम खोजें"
                  : "Find Your Next Job"}
              </Text>

              <Text style={styles.subtitle}>
                {hi
                  ? "आस-पास की नौकरियाँ देखें।"
                  : "Explore available local opportunities."}
              </Text>

              <TextInput
                style={styles.input}
                placeholder={t.search}
                value={search}
                onChangeText={setSearch}
              />

              <View style={styles.stats}>
                <Text style={styles.statText}>
                  {hi ? "उपलब्ध नौकरियाँ" : "Available Jobs"}: {filteredJobs.length}
                </Text>

                <Text style={styles.statText}>
                  {hi ? "आवेदन" : "Applied"}: {applied.length}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                {t.available}
              </Text>

              {filteredJobs.length ? (
                filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <Text style={styles.subtitle}>
                  {hi
                    ? "कोई नौकरी नहीं मिली। दूसरी खोज करें।"
                    : "No jobs found. Try another search."}
                </Text>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={goHome}
              >
                <Text style={styles.secondaryText}>
                  {t.back}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* EMPLOYER DASHBOARD */}

          {screen === "employerDashboard" && (
            <View>
              <Text style={styles.greeting}>
                {hi
                  ? `नमस्ते, ${profile.name}!`
                  : `Welcome, ${profile.name}!`}
              </Text>

              <Text style={styles.heading}>
                {hi ? "नियोक्ता डैशबोर्ड" : "Employer Dashboard"}
              </Text>

              <Text style={styles.subtitle}>
                {hi
                  ? "अपनी नौकरियों और कामगारों को प्रबंधित करें।"
                  : "Manage your job openings and find local workers."}
              </Text>

              <View style={styles.stats}>
                <Text style={styles.statText}>
                  {hi ? "पोस्ट की गई नौकरियाँ" : "Total Jobs Posted"}: {employerJobs.length}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setScreen("postJob")}
              >
                <Text style={styles.buttonText}>
                  ＋ {t.postJob}
                </Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>
                {hi ? "आपकी नौकरियाँ" : "Your Job Listings"}
              </Text>

              {employerJobs.map(job => (
                <View style={styles.jobCard} key={job.id}>
                  <Text style={styles.jobTitle}>
                    {job.title}
                  </Text>

                  <Text style={styles.jobInfo}>
                    📍 {job.city}
                  </Text>

                  <Text style={styles.salary}>
                    💰 {job.salary}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={goHome}
              >
                <Text style={styles.secondaryText}>
                  {t.back}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* POST JOB SCREEN */}

          {screen === "postJob" && (
            <View>
              <TouchableOpacity
                onPress={() => setScreen("employerDashboard")}
              >
                <Text style={styles.back}>
                  ← {hi ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.heading}>
                {hi ? "नौकरी पोस्ट करें" : "Post a Job"}
              </Text>

              <Text style={styles.subtitle}>
                {hi
                  ? "नौकरी की जानकारी भरें।"
                  : "Provide details about the job opening."}
              </Text>

              <Field
                label={hi ? "नौकरी का नाम" : "Job Title"}
                placeholder="e.g. Electrician"
                value={newJob.title}
                onChangeText={v => updateJob("title", v)}
              />

              <Field
                label={hi ? "व्यवसाय का नाम" : "Business Name"}
                placeholder="Your business name"
                value={newJob.company}
                onChangeText={v => updateJob("company", v)}
              />

              <Field
                label={hi ? "शहर" : "City"}
                placeholder="e.g. Mathura"
                value={newJob.city}
                onChangeText={v => updateJob("city", v)}
              />

              <Field
                label={hi ? "वेतन" : "Salary"}
                placeholder="e.g. ₹700/day"
                value={newJob.salary}
                onChangeText={v => updateJob("salary", v)}
              />

              <Text style={styles.label}>
                {hi ? "नौकरी का प्रकार" : "Job Type"}
              </Text>

              <View style={styles.typeRow}>
                {["Full Time", "Part Time", "Daily Wage"].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newJob.type === type && styles.typeSelected
                    ]}
                    onPress={() => updateJob("type", type)}
                  >
                    <Text
                      style={
                        newJob.type === type
                          ? styles.typeSelectedText
                          : styles.typeText
                      }
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Field
                label={hi ? "नौकरी का विवरण" : "Job Description"}
                placeholder="Describe the work..."
                value={newJob.description}
                onChangeText={v => updateJob("description", v)}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={postJob}
              >
                <Text style={styles.buttonText}>
                  {hi ? "नौकरी प्रकाशित करें" : "Publish Job"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* AI ASSISTANT SCREEN */}

          {screen === "assistant" && (
            <View>
              <TouchableOpacity onPress={goHome}>
                <Text style={styles.back}>
                  ← {t.back}
                </Text>
              </TouchableOpacity>

              <Text style={styles.heading}>
                {hi
                  ? "KaamConnect AI सहायक"
                  : "KaamConnect AI Assistant"}
              </Text>

              <Text style={styles.subtitle}>
                {hi
                  ? "आप हिंदी या English में सवाल पूछ सकते हैं।"
                  : "Ask questions in Hindi or English."}
              </Text>

              <View style={styles.chatBox}>
                {chatMessages.length === 0 && (
                  <View style={styles.assistantBubble}>
                    <Text style={styles.chatText}>
                      {hi
                        ? "नमस्ते! आपको किस तरह की नौकरी चाहिए? 😊"
                        : "Hello! What kind of job are you looking for? 😊"}
                    </Text>
                  </View>
                )}

                {chatMessages.map(message => (
                  <View
                    key={message.id}
                    style={[
                      styles.chatBubble,
                      message.sender === "user"
                        ? styles.userBubble
                        : styles.assistantBubble
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatText,
                        message.sender === "user" && styles.userChatText
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder={
                    hi ? "अपना सवाल लिखें..." : "Type your message..."
                  }
                  placeholderTextColor="#929CAA"
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                />

                <TouchableOpacity
                  style={styles.micButton}
                  onPress={() =>
                    Alert.alert(
                      hi
                        ? "वॉइस सुविधा"
                        : "Voice Feature",
                      hi
                        ? "वॉइस सुविधा अगले चरण में जोड़ी जाएगी।"
                        : "Voice feature will be added in the next phase."
                    )
                  }
                >
                  <Text style={styles.buttonText}>🎤</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={sendMessage}
                >
                  <Text style={styles.buttonText}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={styles.footer}>
            © 2026 KaamConnect
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB"
  },

  scroll: {
    padding: 22,
    paddingBottom: 45
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30
  },

  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#173B68"
  },

  language: {
    backgroundColor: "#E2EBF7",
    padding: 10,
    borderRadius: 20
  },

  languageText: {
    color: "#173B68",
    fontWeight: "bold"
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#173B68",
    marginBottom: 10
  },

  subtitle: {
    color: "#68778C",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22
  },

  hero: {
    backgroundColor: "#173B68",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 28
  },

  heroIcon: {
    fontSize: 42
  },

  heroTitle: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 8
  },

  heroText: {
    color: "#D9E7F8",
    textAlign: "center",
    marginTop: 10
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#173B68",
    marginVertical: 15
  },

  roleCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    elevation: 2
  },

  cardIcon: {
    fontSize: 32,
    marginRight: 15
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#173B68"
  },

  cardDescription: {
    color: "#7A8798",
    fontSize: 12,
    marginTop: 5
  },

  arrow: {
    fontSize: 28,
    color: "#173B68"
  },

  field: {
    marginBottom: 16
  },

  label: {
    color: "#173B68",
    fontWeight: "600",
    marginBottom: 8
  },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DFE6EF",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#173B68",
    marginBottom: 12
  },

  primaryButton: {
    backgroundColor: "#173B68",
    padding: 17,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 15
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#173B68",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20
  },

  secondaryText: {
    color: "#173B68",
    fontWeight: "bold"
  },

  back: {
    color: "#2767A8",
    fontWeight: "bold",
    marginBottom: 20,
    fontSize: 15
  },

  greeting: {
    color: "#2767A8",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10
  },

  stats: {
    backgroundColor: "#E2EBF7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    gap: 8
  },

  statText: {
    color: "#173B68",
    fontWeight: "bold"
  },

  jobCard: {
    backgroundColor: "white",
    padding: 17,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2
  },

  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#173B68",
    marginBottom: 8
  },

  company: {
    color: "#52657C",
    marginBottom: 7
  },

  jobInfo: {
    color: "#68778C",
    marginTop: 6
  },

  salary: {
    color: "#13805C",
    fontWeight: "bold",
    marginTop: 8
  },

  description: {
    color: "#68778C",
    marginTop: 10,
    lineHeight: 20
  },

  applyButton: {
    backgroundColor: "#173B68",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15
  },

  disabledButton: {
    backgroundColor: "#7991A9"
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 18
  },

  typeButton: {
    borderWidth: 1,
    borderColor: "#173B68",
    borderRadius: 20,
    padding: 10
  },

  typeSelected: {
    backgroundColor: "#173B68"
  },

  typeText: {
    color: "#173B68",
    fontSize: 12
  },

  typeSelectedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold"
  },

  // AI ASSISTANT STYLES

  chatBox: {
    backgroundColor: "#EAF0F8",
    borderRadius: 15,
    padding: 12,
    minHeight: 300,
    marginBottom: 15
  },

  chatBubble: {
    padding: 13,
    borderRadius: 13,
    marginVertical: 6,
    maxWidth: "85%"
  },

  userBubble: {
    backgroundColor: "#173B68",
    alignSelf: "flex-end"
  },

  assistantBubble: {
    backgroundColor: "white",
    alignSelf: "flex-start"
  },

  chatText: {
    color: "#173B68",
    fontSize: 14,
    lineHeight: 21
  },

  userChatText: {
    color: "white"
  },

  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },

  chatInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DFE6EF",
    borderRadius: 12,
    padding: 13,
    color: "#173B68"
  },

  micButton: {
    backgroundColor: "#13805C",
    padding: 13,
    borderRadius: 12
  },

  sendButton: {
    backgroundColor: "#173B68",
    padding: 13,
    borderRadius: 12
  },

  footer: {
    textAlign: "center",
    color: "#A0AAB8",
    marginTop: 35,
    fontSize: 12
  }
});
