from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        STUDENT = "STUDENT", "Student"
        TEACHER = "TEACHER", "Teacher"
        OTHER = "OTHER", "Other"

    email = models.EmailField(unique=True)
    description = models.TextField("Description", max_length=600, default='', blank=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.OTHER)

    def __str__(self):
        return self.username

class Section(models.Model):
    code = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Sección {self.code}"

    class Meta:
        ordering = ['code']

class StudentManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        results = super().get_queryset(*args, **kwargs)
        return results.filter(role=CustomUser.Role.STUDENT)

class Student(CustomUser):
    objects = StudentManager()

    class Meta:
        proxy = True

    def welcome(self):
        return "Only for students"

class TeacherManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        results = super().get_queryset(*args, **kwargs)
        return results.filter(role=CustomUser.Role.TEACHER)

class Teacher(CustomUser):
    objects = TeacherManager()

    class Meta:
        proxy = True

    def welcome(self):
        return "Only for teachers"

class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True)
    student_id = models.IntegerField(null=True, blank=True)

class TeacherProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    teacher_id = models.IntegerField(null=True, blank=True)

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == CustomUser.Role.STUDENT:
            StudentProfile.objects.create(user=instance)
        elif instance.role == CustomUser.Role.TEACHER:
            TeacherProfile.objects.create(user=instance)
