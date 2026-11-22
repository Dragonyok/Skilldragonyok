/* arcade-firebase.js — ตัวกลาง Firebase สำหรับทุกเกม */
(function (global) {
  'use strict';

  const firebaseConfig = {
    apiKey: "AIzaSyAGu__RjEy0WRI7hYDdKfai9vio8GqWoqw",
    authDomain: "skilldragonyok.firebaseapp.com",
    projectId: "skilldragonyok",
    storageBucket: "skilldragonyok.firebasestorage.app",
    messagingSenderId: "894981973450",
    appId: "1:894981973450:web:39d6f4c2170e774c1d1b33"
  };

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db   = firebase.firestore();
  const TS   = () => firebase.firestore.FieldValue.serverTimestamp();
  const INC  = n  => firebase.firestore.FieldValue.increment(n);

  let _user = auth.currentUser;
  auth.onAuthStateChanged(u => { _user = u; });

  const ArcadeScores = {
    auth, db,
    currentUser() { return _user || auth.currentUser; },
    onAuth(cb) { return auth.onAuthStateChanged(u => { _user = u; cb(u); }); },

    /* สร้างเอกสารผู้ใช้ครั้งแรก */
    async ensureUserDoc(user) {
      if (!user) return;
      const ref  = db.collection('users').doc(user.uid);
      const snap = await ref.get();
      if (!snap.exists) {
        await ref.set({
          uid: user.uid,
          displayName: user.displayName || (user.isAnonymous ? 'ผู้เล่น' : ''),
          email: user.email || '',
          photoURL: user.photoURL || '',
          isAnonymous: user.isAnonymous,
          totalScore: 0, games: {},
          createdAt: TS(), lastSeen: TS()
        });
      } else {
        await ref.update({ lastSeen: TS() });
      }
    },

    /* subscribe คะแนนแบบ real-time */
    watchProfile(uid, cb) {
      return db.collection('users').doc(uid).onSnapshot(
        s => cb(s.exists ? s.data() : {}),
        e => console.warn(e)
      );
    },

    /* ⭐ ฟังก์ชันนี้คือหัวใจ — เรียกจากในเกมเพื่อส่งคะแนน */
    async submitScore(gameId, score, extra) {
      const user = this.currentUser();
      if (!user) throw new Error('ต้องเข้าสู่ระบบก่อนจึงจะบันทึกคะแนนได้');
      const s = Math.max(0, Math.round(Number(score) || 0));
      const ref = db.collection('users').doc(user.uid);

      await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('ไม่พบข้อมูลผู้ใช้');
        const games = snap.data().games || {};
        const cur   = games[gameId] || { total: 0, best: 0, plays: 0 };
        tx.update(ref, {
          totalScore: INC(s),
          ['games.' + gameId]: {
            total: (cur.total || 0) + s,
            best:  Math.max(cur.best || 0, s),
            plays: (cur.plays || 0) + 1,
            lastPlayed: new Date()
          },
          lastSeen: TS()
        });
      });

      // log ประวัติ (ไม่บล็อกถ้าล้มเหลว)
      db.collection('users').doc(user.uid).collection('scores')
        .add({ game: gameId, score: s, extra: extra || {}, at: TS() })
        .catch(() => {});

      return s;
    },

    /* Auth methods */
    signInWithGoogle() {
      return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    },
    async linkGoogle() {
      const user = auth.currentUser;
      if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน');
      const cred = await user.linkWithPopup(new firebase.auth.GoogleAuthProvider());
      await db.collection('users').doc(user.uid).update({
        displayName: cred.user.displayName || '',
        email: cred.user.email || '',
        photoURL: cred.user.photoURL || '',
        isAnonymous: false
      });
      return cred;
    },
    signInAnonymously()             { return auth.signInAnonymously(); },
    signInWithEmail(e, p)           { return auth.signInWithEmailAndPassword(e, p); },
    signUpWithEmail(e, p)           { return auth.createUserWithEmailAndPassword(e, p); },
    signOut()                       { return auth.signOut(); }
  };

  global.ArcadeScores = ArcadeScores;
})(window);