from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('Pagina_Web_Ingles', '0003_alter_quiz_difficulty'),
        ('users', '0002_remove_section_created_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='sections',
            field=models.ManyToManyField(blank=True, related_name='quizzes', to='users.section'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ] 