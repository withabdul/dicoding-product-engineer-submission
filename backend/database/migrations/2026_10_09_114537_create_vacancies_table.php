<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vacancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->index();
            $table->string('position');
            $table->string('job_type');
            $table->unsignedInteger('candidates_needed');
            $table->date('active_until')->index();
            $table->string('location');
            $table->boolean('is_remote')->default(false);
            $table->text('description');
            $table->unsignedBigInteger('salary_min');
            $table->unsignedBigInteger('salary_max')->nullable();
            $table->boolean('show_salary')->default(false);
            $table->string('min_experience');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacancies');
    }
};
