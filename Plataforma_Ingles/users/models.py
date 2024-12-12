from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError

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

    def generate_username_from_email(self):
        email_prefix = self.email.split('@')[0]
        base_username = email_prefix
        
        # Verificar si el username ya existe
        counter = 1
        username = base_username
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        return username

class Section(models.Model):
    code = models.CharField(
        max_length=50, 
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^IN[UI]\d{4}\s*-\s*\d{3}[A-Z]$',
                message='El formato debe ser "INU1234-123X" o "INI1234-123X" donde 1234 y 123 son números y X es una letra',
            )
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def clean(self):
        if self.code:
            parts = self.code.replace(' ', '').split('-')
            if len(parts) == 2:
                self.code = f"{parts[0]} - {parts[1]}"

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sección {self.code}"

    class Meta:
        ordering = ['code']
        verbose_name = "Sección"
        verbose_name_plural = "Secciones"

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
    section = models.ForeignKey(
        Section, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='students'
    )
    student_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.section.code if self.section else 'Sin sección'}"

    class Meta:
        verbose_name = "Perfil de Estudiante"
        verbose_name_plural = "Perfiles de Estudiantes"

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
