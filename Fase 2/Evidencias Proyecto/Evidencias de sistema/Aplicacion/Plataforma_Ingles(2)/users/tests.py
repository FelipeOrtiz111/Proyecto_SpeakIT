from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Section, StudentProfile, TeacherProfile, CustomUser

class UserModelTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        
    def test_create_user(self):
        user = self.User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        
    def test_create_superuser(self):
        admin_user = self.User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.assertEqual(admin_user.username, 'admin')
        self.assertEqual(admin_user.email, 'admin@example.com')
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

class SectionModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='teacherpass123',
            role=CustomUser.Role.TEACHER
        )
        
    def test_create_section(self):
        section = Section.objects.create(
            code='SEC001',
            created_by=self.user
        )
        self.assertEqual(section.code, 'SEC001')
        self.assertEqual(section.created_by, self.user)
        self.assertTrue(section.is_active)

class ProfileTests(TestCase):
    def setUp(self):
        self.student = get_user_model().objects.create_user(
            username='student',
            email='student@example.com',
            password='studentpass123',
            role=CustomUser.Role.STUDENT
        )
        self.teacher = get_user_model().objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='teacherpass123',
            role=CustomUser.Role.TEACHER
        )
        
    def test_student_profile_creation(self):
        """Test that a StudentProfile is created when a student user is created"""
        self.assertTrue(hasattr(self.student, 'studentprofile'))
        self.assertIsInstance(self.student.studentprofile, StudentProfile)
        
    def test_teacher_profile_creation(self):
        """Test that a TeacherProfile is created when a teacher user is created"""
        self.assertTrue(hasattr(self.teacher, 'teacherprofile'))
        self.assertIsInstance(self.teacher.teacherprofile, TeacherProfile)
