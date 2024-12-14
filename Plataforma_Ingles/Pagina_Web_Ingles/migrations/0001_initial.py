from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('users', '0002_remove_section_created_by'),
    ]

    operations = [
        migrations.CreateModel(
            name='Quiz',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('level', models.CharField(choices=[('basic', 'Básico'), ('elementary', 'Elemental')], default='basic', max_length=20)),
                ('number_of_questions', models.IntegerField()),
                ('time', models.IntegerField(help_text='duración del quiz en minutos')),
                ('required_score_to_pass', models.IntegerField(help_text='puntaje requerido para pasar')),
                ('difficulty', models.CharField(choices=[('easy', 'Fácil'), ('medium', 'Medio'), ('hard', 'Difícil')], max_length=10)),
                ('allowed_attempts', models.IntegerField(default=3, help_text='número de intentos permitidos')),
                ('is_active', models.BooleanField(default=True)),
                ('sections', models.ManyToManyField(blank=True, related_name='quizzes', to='users.section')),
            ],
            options={
                'verbose_name_plural': 'Quizes',
            },
        ),
    ]
